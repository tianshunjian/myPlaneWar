
cc.Class({
    extends: cc.Component,

    properties: {
        kuang: cc.Sprite,
        normalKuang: cc.SpriteFrame,
        selectKuang: cc.SpriteFrame,
        selectPlane: cc.Sprite,
        nameLabel: cc.Label,
        isSelected: false,
        id: -1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {},

    initItem(obj){
        this.nameLabel.string = obj.name
        this.isSelected = obj.isSelected
        this.id = obj.id
        this.selectPlane.spriteFrame = obj.plane
        this.node.rotation = obj.rotate
        this.itemClickCallback = obj.itemClickCallback
        this.updateItem(obj.isSelected)
    },

    updateItem(isSelected){
        this.isSelected = isSelected
        let colorStr = isSelected ? '#FFF45C' : '#07FCFF'
        this.nameLabel.node.color = cc.hexToColor(colorStr)
        this.kuang.spriteFrame = isSelected ? this.selectKuang : this.normalKuang
    },

    onItemClicked(){
        this.itemClickCallback(this.id)
        this.itemClickCallback && this.itemClickCallback(this.id)
    },

    // update (dt) {},
});
