var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        backButton: cc.Button,
        openButton: cc.Button,
        scoreLabel: cc.Label,
        rankButton: cc.Button,
        restartButton: cc.Button,
        descLabel: cc.Label,
        titleFrame: cc.SpriteFrame,
        openBoxFrame: cc.SpriteFrame,
        title: cc.Node,
        couponFrame: cc.SpriteFrame,
        box: cc.Node,
        subtitle: cc.Node,
        subtitleFrame: cc.SpriteFrame,
        rankLabel: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       this.openClicked = false
    },

    start () {
        this.scoreLabel.string = '本次得分：' + Global.score + '分'
        this.updateRank()
    },

    updateRank() {
        let scores = cc.sys.localStorage.getItem('scores');
        let scoresArr = scores ? JSON.parse(scores) : []
        console.log(scoresArr)

        let len = scoresArr.length
        let rank = 0;
        for(let i = 0; i < len; i++ ){
            if(scoresArr[i] === Global.score) {
                rank = i + 1
                break;
            }
        }
        this.rankLabel.string = '本次排名： 第' + rank + '名'
    },

    backButtonClicked(){
        cc.director.loadScene('menu');
    },

    rankButtonClicked() {
        cc.director.loadScene('rank')
    },

    openButtonClicked() {
        if(this.openClicked) {
            console.log('handle url')
            window.location.href = 'capp://rpos-online?pageUrl=https://shopex.homecreditcfc.cn/capp/redirect.html&data={"link_type":"voucher"}';
            return
        }
        this.openClicked = true
        this.title.getComponent('cc.Sprite').spriteFrame = this.titleFrame
        this.openButton.getComponent('cc.Sprite').spriteFrame = this.couponFrame
        this.box.getComponent('cc.Sprite').spriteFrame = this.openBoxFrame
        this.subtitle.getComponent('cc.Sprite').spriteFrame = this.subtitleFrame
        this.subtitle.setContentSize({width: 511, height: 85})
    },

    restartButtonClicked() {
        cc.director.loadScene('game')
    }

    // update (dt) {},
});
