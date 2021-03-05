
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {},

    update (dt) {},

    onAnimationEnd: function(){
        this.node.destroy();
    },
});
