'use strict';

const fs = require('fs');
const path = require('path');
const slue = require('slue');
const $ = require('slue-plugins-loader')();
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const delEmpty = require('delete-empty');

const args = process.argv;
const app_name = 'paas-workprocess';
const src_path = 'src';
const dev_path = 'dev';
const build_path = 'build';
const concat_path = './concat.json';
const all_css = 'assets/style/all';
const css_sprite_path = 'assets/images/sprite';
//const build_tpls = false;

const notifyError = function(err, task, name) {
    $.notify.onError({
        title: `${app_name} ${task}`,
        subtitle: 'Failure!',
        message: `${name} error: <%= error.message %>`,
        sound: 'Beep'
    })(err);
    this.end();
};

/**
 * eslint静态扫描代码
 */
slue.task('eslint', () => {
    slue.read([`${src_path}/**/*.js`])
        .pipe($.plumber({
            errorHandler(err) {
                notifyError.call(this, err, 'eslint', 'js lint')
            }
        }))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
});

/**
 * 清理dev/build目录
 */
const clean = (path) => {
    let task = `${path}-clean`;
    slue.task(task, () => del(path));
    return task;
}

/**
 * 复制文件到build目录
 */
const copy = (path, files) => {
    let task = `${path}-copy`;
    slue.task(task, () => {
        if (!files) {
            files = [`${src_path}/**/*.*`];
            if (path === build_path) {
                let excludes = [
                    `!${src_path}/app.js`,
                    `!${src_path}/tpls/**/*.*`
                ];
                files = files.concat(excludes);
            }
        }
        return slue.read(files, {
            base: src_path
        }).pipe(slue.write(path));
    });
    return task;
};

/**
 * 加载子模版
 */
const tmpImport = (path) => {
    let task = `${path}-impt`;
    slue.task(task, () => {
        return slue.read(`${path}/**/*.html`)
            .pipe($.templateImport())
            .pipe(slue.write(path));
    });
    return task;
};

/**
 * 编译less，执行postcss后处理器
 */
const less = (path) => {
    let task = `${path}-less`;
    slue.task(task, () => {
        // 要支持的浏览器版本列表
        let browsers = [
            'chrome >= 30',
            'ff >= 30',
            'safari >= 5',
            'opera >= 30',
            'edge >= 12',
            'ie >= 9'
        ];

        // css后处理器列表
        let processors = [
            // 自动补前缀，根据浏览器列表决定
            autoprefixer({
                browsers: browsers
            }),
            // css优化处理
            cssnano({
                colormin: {
                    legacy: true
                },
                core: false,
                zindex: false,
                discardUnused: {
                    keyframes: false // 不删除未使用的keyframes声明
                }
            })
        ];
        return slue.read(`${path}/${all_css}.less`)
            .pipe($.plumber({
                errorHandler(err) {
                    notifyError.call(this, err, task, 'less')
                }
            }))
            .pipe($.less())
            .pipe($.postcss(processors))
            .pipe(slue.write(`${path}/assets/style`));
    });
    return task;
};

/**
 * 预编译underscore模板
 */
const jst = (path) => {
    let task = `${path}-jst`;
    slue.task(task, () =>
        slue.read([
            `${path}/**/*.html`,
            `!${path}/tpls/**/*.html`,
            `!${path}/pages/**/*.html`
        ])
        .pipe($.plumber({
            errorHandler(err) {
                notifyError.call(this, err, task, 'html jst')
            }
        }))
        .pipe($.htmlmin({
            minifyCSS: false,
            minifyJS: true,
            removeComments: false,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            processConditionalComments: true,
            customAttrSurround: [
                [/##[^#]*\{\s*##/, /##\s*\}[^#]*##/]
            ]
        }))
        .pipe($.template.precompile({
            evaluate: /##([\s\S]+?)##/g,
            interpolate: /\{\{(.+?)\}\}/g,
            escape: /\{\{\{\{-([\s\S]+?)\}\}\}\}/g
        }))
        .pipe($.wrap('define(function(require, exports, module){return <%= contents %>});'))
        .pipe($.rename({
            suffix: '-html',
            extname: '.js'
        }))
        .pipe(slue.write(path))
    );
    return task;
};

/**
 * 合成sprite
 */
const sprite = (path) => {
    let task = `${path}-sprite`;
    slue.task(task, () =>
        slue.read(`${path}/**/*.css`)
        .pipe($.plumber({
            errorHandler(err) {
                notifyError.call(this, err, task, 'css sprite')
            }
        }))
        .pipe($.cssSpritesmith({
            imagepath: `${path}/${css_sprite_path}/`,
            imagepath_map: null,
            spritedest: `${path}/assets/images/`,
            spritepath: '../../assets/images',
            padding: 4,
            useimageset: false,
            newsprite: false,
            spritestamp: false,
            cssstamp: false,
            algorithm: 'binary-tree',
            engine: 'pixelsmith'
        }))
        .pipe(slue.write(''))
    );
    return task;
};

/**
 * babel转译ES6
 */
const babel = (path, src) => {
    let task = `${path}-babel`;
    let needSourceMaps = path === dev_path;
    // `${path}/**/*{!-html, !.min}.js`
    slue.task(task, () => {
        return slue.read(src || [
                `${path}/**/*.js`,
                `!${path}/**/*-html.js`,
                `!${path}/**/*.min.js`
            ], {
                base: path
            })
            .pipe($.plumber({
                errorHandler(err) {
                    notifyError.call(this, err, task, 'js babel')
                }
            }))
            .pipe($.if(needSourceMaps, $.sourcemaps.init()))
            .pipe($.babel({
                compact: false
            }))
            .pipe($.if(needSourceMaps, $.sourcemaps.write('.')))
            .pipe(slue.write(path))
    });
    return task;
};

/**
 * watch文件变化
 */
slue.task('watch', () => {
    // 图片等静态文件拷贝
    let copyGlob = [
        `src/**/*.*`,
        `!src/**/*.less`,
        `!src/**/*.html`,
        `!src/**/*.js`
    ];
    let copyWathcer = slue.watch(copyGlob);
    copyWathcer.on('change', function() {
        $.sequence([copy(dev_path)])();
    });

    // js文件改动编译
    let jsFileWatcher = slue.watch([`src/**/*.js`, `!src/**/*-html.js`]);
    jsFileWatcher.on('change', function(filePath) {
        let basename = path.basename(filePath);
        $.sequence([copy(dev_path, [`src/**/${basename}`]), babel(dev_path, [`${dev_path}/**/${basename}`])])();
    });

    // html文件改动编译
    let htmlFileWatcher = slue.watch([`src/**/*.html`, `!src/tpls/**/*.html`]);
    htmlFileWatcher.on('change', function() {
        $.sequence([copy(dev_path), tmpImport(dev_path), jst(dev_path)])();
    });

    // less文件改动编译
    let lessFileWatcher = slue.watch(`src/**/*.less`);
    lessFileWatcher.on('change', function() {
        $.sequence([copy(dev_path), less(dev_path)])();
    });
});

const transport = (type) => {
    let path = build_path + (type ? `/${type}` : '');
    let src = path + (type ? '/**' : '') + '/*.js';
    let task = `transport:${type || 'main'}`;
    return slue.read(src, {
            base: path
        })
        .pipe($.plumber({
            errorHandler(err) {
                notifyError.call(this, err, task, 'cmd transport')
            }
        }))
        .pipe($.seajsTransport({
            idleading: app_name + (type ? `-${type}` : '') + '/'
        }))
        .pipe(slue.write(path))
};

/**
 * seajs transport
 */
slue.task('transport:main', () => transport());
slue.task('transport:assets', () => transport('assets'));
slue.task('transport:modules', () => transport('modules'));
slue.task('transport:tpls', () => transport('tpls'));

/**
 * 合并js文件
 * 支持产出多个包
 */
const concatJS = [];
const concatConfigs = require(concat_path);
for (let concat in concatConfigs) {
    let task = `concat:${concat}`;
    let src = concatConfigs[concat].map(function(item) {
        return `${build_path}/${item}`;
    });
    slue.task(task, () => {
        return slue.read(src)
            .pipe($.plumber({
                errorHandler(err) {
                    notifyError.call(this, err, 'concat', 'js concat')
                }
            }))
            .pipe($.concat(concat))
            .pipe(slue.write(build_path))
    });
    concatJS.push(task);
}
/**
 * 删除已被合并的碎片文件
 */
slue.task('del-concated', () => {
    let configs = require(concat_path);
    let fragments = [];

    for (let name in configs) {
        let files = configs[name];
        for (let file of files) {
            if (file === name || fragments.indexOf(file) >= 0) continue;
            fragments.push(build_path + '/' + file);
        }
    }

    return del(fragments);
});

/**
 * 压缩js
 */
slue.task('uglify', () =>
    slue.read(`${build_path}/**/*.js`)
    .pipe($.plumber({
        errorHandler(err) {
            notifyError.call(this, err, 'uglify', 'js uglify')
        }
    }))
    .pipe($.uglify({
        compress: {
            drop_console: true
        },
        output: {
            comments: false,
            keep_quoted_props: true
        }
    }))
    .pipe(slue.write(build_path))
);

/**
 * 压缩css
 */
slue.task('cssmin', () =>
    slue.read(`${build_path}/**/*.css`)
    .pipe($.plumber({
        errorHandler(err) {
            notifyError.call(this, err, 'cssmin', 'css minify')
        }
    }))
    .pipe($.cleanCss())
    .pipe(slue.write(build_path))
);

/**
 * 压缩图片
 */
slue.task('imagemin', () =>
    slue.read([
        `${build_path}/**/*.{jpg,jpeg,png,gif}`,
        `!${build_path}/${css_sprite_path}/**/*.*`
    ])
    .pipe($.plumber({
        errorHandler(err) {
            notifyError.call(this, err, 'imagemin', 'image minify')
        }
    }))
    .pipe($.cache($.imagemin([
        $.imagemin.gifsicle(),
        $.imagemin.jpegtran({
            progressive: true
        }),
        $.imagemin.optipng({
            optimizationLevel: 5
        })
    ], {
        verbose: true
    })))
    .pipe(slue.write(build_path))
);

/**
 * 计算图片/字体等CSS资源文件md5 hash
 */
slue.task('md5-assets', () =>
    slue.read([
        `${build_path}/**/*.{jpg,jpeg,png,gif,woff,eot,ttf}`,
        `!${build_path}/${css_sprite_path}/**/*.*`
    ])
    .pipe($.rev())
    .pipe(slue.write(build_path))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest())
    .pipe(slue.write(`${build_path}/rev/assets`))
);

/**
 * 替换图片/字体等CSS资源路径为带md5 hash的版本
 */
slue.task('rev-assets', () =>
    slue.read([
        `${build_path}/rev/assets/*.json`,
        `${build_path}/**/*.css`,
        `${build_path}/**/*.js`
    ])
    .pipe($.revCollector({
        replaceReved: true
    }))
    .pipe(slue.write(build_path))
);

/**
 * 计算all.css md5 hash
 */
slue.task('md5-css', () =>
    slue.read(`${build_path}/${all_css}.css`)
    .pipe($.rev())
    .pipe(slue.write(`${build_path}/assets/style`))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest())
    .pipe(slue.write(`${build_path}/rev/css`))
);

/**
 * 替换all.css为带md5 hash的版本
 */
slue.task('rev-css', () =>
    slue.read([
        `${build_path}/rev/css/*.json`,
        `${build_path}/**/*.js`
    ])
    .pipe($.revCollector({
        replaceReved: true
    }))
    .pipe(slue.write(build_path))
);

/**
 * 计算js md5 hash，并记录中tpl_config
 * 支持多js包
 */
slue.task('md5-js', () =>
    slue.read(`${build_path}/**/*.js`, {
        base: src_path
    })
    .pipe($.rev())
    .pipe(slue.write(build_path))
    //.pipe($.revDeleteOriginal())
    .pipe($.rev.manifest())
    .pipe(slue.write(`${build_path}/rev/js`))
);

/**
 * 生成js hash 的配置文件
 * 支持多js包
 */
slue.task('tpl-config', () => {
    let json = require(`./${build_path}/rev/js/rev-manifest.json`);
    if (!json) return;
    let content = '';
    for (let o in json) content += `${app_name}-${o.split('.')[0]}:${json[o]}\n`;
    fs.writeFile(`${build_path}/tpl_config`, content, function(err) {
        if (err) {
            notifyError.call(this, err, 'tpl-config', 'write tpl_config');
            return;
        }
        console.log('write ' + content + ' ok');
    });
});

/**
 * 清理build后的无用文件和目录
 */
slue.task('clean-tmp', () => {
    del.sync([
        `${build_path}/**/*.less`,
        `${build_path}/modules/**/*.html`,
        `${build_path}/${css_sprite_path}`,
        `${build_path}/rev`
    ]);
    delEmpty.sync(build_path);
});

/**
 * 清空构建缓存
 */
slue.task('cache-clear', (done) => $.cache.clearAll(done));

/**
 * 开发模式构建任务
 */
let devTasks = [
    clean(dev_path),
    'eslint',
    'watch',
    copy(dev_path),
    tmpImport(dev_path),
    less(dev_path),
    jst(dev_path),
    babel(dev_path),
    sprite(dev_path)
];
slue.task('dev', $.sequence(devTasks));

/**
 * 测试和生产环境构建任务
 */
let buildTasks = [
    clean(build_path),
    copy(build_path),
    tmpImport(build_path),
    less(build_path),
    jst(build_path),
    babel(build_path),
    sprite(build_path),
    'transport:main',
    'transport:assets',
    'transport:modules',
    'transport:tpls',
    'md5-assets',
    'rev-assets'
];
buildTasks = buildTasks.concat(concatJS, [
    'del-concated',
    'uglify',
    'cssmin',
    'imagemin',
    'md5-js',
    'md5-css',
    'rev-css',
    'tpl-config'
]);
slue.task('build', $.sequence(buildTasks));