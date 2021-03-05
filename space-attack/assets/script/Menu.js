cc.Class({
    extends: cc.Component,

    properties: {
        bgNode: cc.Node,
    },

    onLoad: function () {

    },

    playGame: function(){
        cc.director.loadScene('PlaneReady');
    },

    update: function (dt) {

    },
});
