
cc.Class({
    extends: cc.Component,

    properties: {
        speed: 500,
        speedX: 0,
        bulletSprite: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.rotate = 0;
    },

    updateBulletAttri(speedX, rotate, bulletSpriteFrame){
        this.speedX = speedX;
        this.node.rotation = rotate;
        this.bulletSprite.spriteFrame = bulletSpriteFrame;
    },

    update (dt) {
        this.node.y -= this.speed * dt;
        this.node.x += this.speedX * dt;

        if(this.node.y <= -this.node.parent.height / 2
          || this.node.x >= this.node.parent.width / 2
          || this.node.x <= -this.node.parent.width / 2){
            this.node.destroy();
        }
    },

    onCollisionEnter: function(other, self){
        let plane = other.getComponent('Plane');
        plane.updateHp();
        this.node.destroy();
    },
});
