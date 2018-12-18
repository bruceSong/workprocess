project=workprocess

env=html53
if [ -n "$1" ]; then
    env=$1
fi

svn_dir=http://172.31.101.59/SVN/$env/paas/$project
username=mxy
password=mxy

mkdir svn_deploy_dir
cd svn_deploy_dir
svn co $svn_dir --username $username --password $password --no-auth-cache
cp -rf ../dev/* ./$project
cd $project
svn add * --force --username $username --password $password --no-auth-cache
svn ci -m "dev" --username $username --password $password --no-auth-cache
cd ../../
rm -rf svn_deploy_dir
echo "$env deploy success!!!"