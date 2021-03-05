var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        harm: 1,
        speed: 0,
        bullet: cc.Sprite,
    },

    onLoad: function () {
        this.speedX = 0;
    },

    start(){

    },

    setSpeedX(speedX, harm){
        this.speedX = speedX;
        this.harm = harm;
    },

    update: function (dt) {
        this.node.y += this.speed * dt;
        this.node.x += this.speedX * dt;

        if( this.node.y >= this.node.parent.height / 2 ||
          this.node.x >= this.node.parent.width/2 ||
          this.node.x <= -this.node.parent.width/2 ) {
            this.node.destroy();
        }
    },

    onCollisionEnter: function(other, self){
        let x = self.node.x;
        let y = self.node.y;
        if(other.node.name == 'Enemy'){
            let enemy = other.getComponent('Enemy');
            enemy.hp = enemy.hp - this.harm;
            this.game.fireBulletDeadEffect(x, y);
        }else{
            let enemy = other.getComponent('SmallEnemy');
            enemy.hp = enemy.hp - this.harm;
            this.game.fireBulletDeadEffect(x, y);
        }
        this.node.destroy();
    }

});
