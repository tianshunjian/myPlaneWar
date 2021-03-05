var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        border: cc.Node,
        itemPrefab: cc.Prefab,
        rankFrames: [cc.SpriteFrame],
        selectedFrames: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initScoreList()
    },

    start () {

    },

    initScoreList() {
        this.items = []
        let height = this.border.height / 2
        console.log(height)

        let scores = cc.sys.localStorage.getItem('scores');
        let scoresArr = scores ? JSON.parse(scores) : []
        console.log(scoresArr)

        let len = scoresArr.length
        if(len < 10) {
            for(let i = 0; i < 10 - len; i++ ){
                scoresArr.push(0)
            }
        }
        let findCurrentScore = false
        for(let i = 0; i < 10; i++) {
            let item = cc.instantiate(this.itemPrefab);
            item.getChildByName('score').getComponent('cc.Label').string = `${scoresArr[i]}分`
            this.border.addChild(item);
            this.items.push(item)
            item.getChildByName('icon').getComponent('cc.Sprite').spriteFrame = this.rankFrames[i]
            if(Global.score === scoresArr[i] && !findCurrentScore) {
                findCurrentScore = true
                item.getChildByName('bg').active = true;
                item.getChildByName('score').color = cc.Color.WHITE
                item.getChildByName('icon').getComponent('cc.Sprite').spriteFrame = this.selectedFrames[i]
            }
            item.setPosition(cc.p(-5,height - 200 - i * 88));
        }
    },

    onBackButtonClicked () {
        cc.director.loadScene('result')
    }

    // update (dt) {},
});
