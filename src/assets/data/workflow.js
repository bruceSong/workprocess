define(function() {
    return {
        activities: [{
            id: "start",
            type: "startEvent"
        }, {
            type: "endEvent",
            id: "end"
        }],
        variables: [],
        transitions: [{
            id: "line0",
            fromId: "start",
            toId: "nodeGateway0",
            serialNumber: 0
        }]
    };
});