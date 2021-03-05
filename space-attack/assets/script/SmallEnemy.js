var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        hp: 10,
        speed: 0,
        score: 1,
        planeNode: cc.Sprite,
        bullet: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.speedX = 0;
        this.rand = cc.random0To1() <= 0.5 ? 0 : 1;
    },

    // 小敌机子弹数量shootNum只能设置为：1 or 3
    updateActionTypeAndDelay(type, delay, canShoot, shootNum, speedX, hp, spriteFrame, bulletSpriteFrame){
        this.planeNode.spriteFrame = spriteFrame;
        this.actionType = type;
        this.canShoot = canShoot;
        this.shootNum = shootNum;
        this.speedX = speedX;
        this.hp = hp;
        this.scheduleOnce(()=>{
            let action = this.getActionByType(type);
            action != null && this.node.runAction(action);
        }, delay);

        let allTypes = Global.SmallEnemyActionTypes;
        if(canShoot){
            let shootDelay = 0;
            let interval = 0.4;
            if(type == allTypes.bezierPath){
                interval = 0.5;
                shootDelay = 0.4;
            }
            this.shootCallback = ()=>{
                let attributions = this.getBulletAttributions();
                for(let i=0; i<this.shootNum; i++){
                    let bullet = cc.instantiate(this.bullet);
                    this.node.parent.addChild(bullet);
                    bullet.setPosition(cc.p(attributions[i].x, attributions[i].y));
                    bullet.getComponent('SmallEnemyBullet').updateBulletAttri(
                      attributions[i].speedX,
                      attributions[i].rotate,
                      bulletSpriteFrame
                    );
                }
            };
            this.schedule(this.shootCallback, interval, cc.macro.REPEAT_FOREVER, shootDelay);
        }
    },

    getBulletAttributions(){
        let attr = [
            {
                x: this.node.x - this.node.width/2 + 35,
                y: this.node.y - this.node.height/2 - 10,
                rotate: 20,
                speedX: -100,
            },
            {
                x: this.node.x,
                y: this.node.y - this.node.height/2 - 20,
                rotate: 0,
                speedX: 0,
            },
            {
                x: this.node.x + this.node.width/2 - 35,
                y: this.node.y - this.node.height/2 - 10,
                rotate: -20,
                speedX: 100,
            }
        ];
        switch (this.shootNum) {
            case 3:
                return attr;
            default:
                return [{
                    x: this.node.x,
                    y: this.node.y - this.node.height/2 - 30,
                    rotate: 0,
                    speedX: 0,
                }];

        }
    },

    getActionByType(type){
        let x = this.node.x, y = this.node.y, w = this.node.w, h = this.node.height;
        let parentWidth = this.game.node.width, parentHeight = this.game.node.height;
        let allTypes = Global.SmallEnemyActionTypes;
        let action;
        switch (type) {
            case allTypes.defaultType:
                let posX = x, posY = -parentHeight/2 - h/2 - 50;
                let duration = 2;
                action = cc.moveTo(duration, cc.p(posX, posY));
                break;
            case allTypes.nineFall:
                action = null;
                break;
            case allTypes.bezierPath:
                let startX = x, endX = x>0 ? -startX-30 : -startX+30;
                let bezier = [cc.p(startX, y), cc.p(0, -150), cc.p(endX,y)];
                action = cc.bezierTo(2, bezier);
                break;
            case allTypes.pingpong:
                this.speed = 400;
                this.speedX = x < 0 ? this.speedX : -this.speedX;
                action = null;
                break;
            default:
                action = null;
        }
        return action;
    },

    update (dt) {
        let allTypes = Global.SmallEnemyActionTypes;

        if(this.actionType == allTypes.pingpong || this.actionType == allTypes.nineFall){
            this.node.y -= this.speed * dt;
            this.node.x += this.speedX * dt;
            if(this.node.x >= this.node.parent.width/2-this.node.width/2 ||
              this.node.x <= -this.node.parent.width/2+this.node.width/2
            ) {
                this.speedX = -this.speedX;
            }
        }

        if(this.actionType == allTypes.bezierPath){
            if(this.node.x >= this.node.parent.width/2+this.node.width/2+10 ||
              this.node.x <= -this.node.parent.width/2-this.node.width/2-10 ||
              this.hp<=0){
                if(this.hp <= 0){
                    this.game.gainScore(this.score);
                    this.game.fireSmallBoom(this.rand, this.node.x, this.node.y);
                }
                this.node.stopAllActions();
                this.shootCallback && this.unschedule(this.shootCallback);
                this.node.destroy();
                return;
            }
        }

        if(this.node.y <= -this.node.parent.height / 2 - this.node.height/2 || this.hp <= 0){
            if(this.hp <= 0){
                this.game.gainScore(this.score);
                this.game.fireSmallBoom(this.rand, this.node.x, this.node.y);
            }
            this.node.stopAllActions();
            this.shootCallback && this.unschedule(this.shootCallback);
            this.node.destroy();
        }

    },

    onCollisionEnter: function(other, self){
        if(self.node.y >= self.getComponent('SmallEnemy').game.node.height/2-self.node.height/2) return;
        if(other.node.name == 'Plane'){
            let plane = other.getComponent('Plane');
            plane.updateHp();
            this.hp = 0;
        }
    },
});
