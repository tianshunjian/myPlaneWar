var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        hp: 0,
        fireGap: 0.15,
        bullet: cc.Prefab,
        shield: cc.Node,
        shieldHP: 0,
        plane: cc.Sprite,
        players: [cc.SpriteFrame],
        bulletHarm: 1,
    },

    onLoad: function () {
        this.remainHp = this.hp;
        this.bulletNumArr = [3, 5, 7];
        this.bulletNum = this.bulletNumArr[0];

        this.rotateForPlanes = [0, 0, 0, 0, 0, 0];

        this.schedule(function(){
            this.fireBullet();
        }, this.fireGap);

        this.hideShield();
    },

    start(){
        this.plane.spriteFrame = this.players[Global.selectedPlaneNum];
        this.node.rotation = this.rotateForPlanes[Global.selectedPlaneNum];
    },

    updateBulletNum(){
        let index = this.bulletNumArr.indexOf(this.bulletNum);
        if(index < this.bulletNumArr.length-1){
            this.bulletNum = this.bulletNumArr[index+1];
        } else {
            this.bulletHarm++;
            if(this.bulletHarm >= 3){
                this.bulletHarm = 3;
            }
        }
    },

    hideShield(){
        this.shieldHP = 0;
        this.shield.active = false;
    },

    showShield(){
        this.shieldHP = 10;
        this.shield.active = true;
    },

    fireBullet: function(){
        let index = this.bulletNumArr.indexOf(this.bulletNum);
        let bulletAttributions = this.getBulletAttributions();
        let attribution = bulletAttributions[index];
        for(let i = 0; i < this.bulletNum; i++){
            let newBullet = cc.instantiate(this.bullet);
            newBullet.setPosition(cc.p(attribution[i].x, attribution[i].y));
            newBullet.rotation = attribution[i].rotate;
            this.node.parent.addChild(newBullet);
            newBullet.getComponent('Bullet').setSpeedX(attribution[i].speedX, this.bulletHarm);
            newBullet.getComponent('Bullet').game = this.game;
        }
    },

    updateHp(){
        if(this.shield.active && this.shieldHP > 0){
            this.shieldHP--;
        }else{
            this.remainHp--;
        }
        if(this.remainHp <= 0) {
          this.remainHp = 0;
        }
        this.game.updateHeroHp();
    },

    update: function (dt) {
        if(this.shieldHP <= 0){
            this.hideShield();
        }

        if(this.remainHp <= 0){
            this.game.fireBoom(this.node.x, this.node.y);
            this.game.gameOver();
            this.node.destroy();
        }
    },

    getBulletAttributions(){
        let bulletPositions = [
            [
                {
                    x: this.node.x - this.node.width/2 + 35,
                    y: this.node.y + this.node.height/2 + 10,
                    rotate: 0,
                    speedX: 0,
                },
                {
                    x: this.node.x,
                    y: this.node.y + this.node.height/2 + 20,
                    rotate: 0,
                    speedX: 0,
                },
                {
                    x: this.node.x + this.node.width/2 - 35,
                    y: this.node.y + this.node.height/2 + 10,
                    rotate: 0,
                    speedX: 0,
                }
            ],
            [
                {
                    x: this.node.x - this.node.width/2 + 5,
                    y: this.node.y + this.node.height/2 + 5,
                    rotate: -20,
                    speedX: -100,
                },
                {
                    x: this.node.x - this.node.width/4,
                    y: this.node.y + this.node.height/2 + 10,
                    rotate: -5,
                    speedX: -50,
                },
                {
                    x: this.node.x ,
                    y: this.node.y + this.node.height/2 + 30,
                    rotate: 0,
                    speedX: 0,
                },
                {
                    x: this.node.x + this.node.width/4,
                    y: this.node.y + this.node.height/2 + 10,
                    rotate: 5,
                    speedX: 50,
                },
                {
                    x: this.node.x + this.node.width/2 - 5,
                    y: this.node.y + this.node.height/2 + 5,
                    rotate: 20,
                    speedX: 100,
                }
            ],
            [
                {
                    x: this.node.x - this.node.width/2 ,
                    y: this.node.y + this.node.height/2 ,
                    rotate: -30,
                    speedX: -140,
                },
                {
                    x: this.node.x - this.node.width/4 - 15,
                    y: this.node.y + this.node.height/2 + 10,
                    rotate: -15,
                    speedX: -100,
                },
                {
                    x: this.node.x - 40,
                    y: this.node.y + this.node.height/2 + 20,
                    rotate: 0,
                    speedX: 0,
                },
                {
                    x: this.node.x,
                    y: this.node.y + this.node.height/2 + 35,
                    rotate: 0,
                    speedX: 0,
                },
                {
                    x: this.node.x + 40,
                    y: this.node.y + this.node.height/2 + 20,
                    rotate: 0,
                    speedX: 0,
                },
                {
                    x: this.node.x + this.node.width/4 + 15,
                    y: this.node.y + this.node.height/2 + 10,
                    rotate: 15,
                    speedX: 100,
                },
                {
                    x: this.node.x + this.node.width/2 ,
                    y: this.node.y + this.node.height/2 ,
                    rotate: 30,
                    speedX: 140,
                }
            ],
        ];
        return bulletPositions;
    },

    onCollisionEnter: function(other, self){

    }

});
