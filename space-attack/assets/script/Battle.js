var Global = require('Global');

module.exports = cc.Class({
    extends: cc.Component,

    // lambda表达式 解决循环引用
    properties: () => ({
        secretNode: cc.Node,
        planePrefab: cc.Prefab,
        enemyPrefab: cc.Prefab,
        boomPrefab: cc.Prefab,
        smallBoom1Prefab: cc.Prefab,
        smallBoom2Prefab: cc.Prefab,
        backgroundPrefab: cc.Prefab,
        smallEnemyPrefab: cc.Prefab,
        ufoBulletPrefab: cc.Prefab,
        ufoBombPrefab: cc.Prefab,
        ufoDiamondPrefab: cc.Prefab,
        boomEffectPrefab: cc.Prefab,
        bulletDeadEffectPrefab: cc.Prefab,
        shieldPrefab: cc.Prefab,
        battleBgm: cc.AudioClip,
        ui: require('UI'),
        useBombButton: cc.Button,
        levels: [cc.Integer],
        bosses:[cc.Integer],
        smallEnemyPlanes: [cc.SpriteFrame],
        smallEnemyBulletSprites: [cc.SpriteFrame],
    }),

    onLoad: function () {
        this.surviveNum = 3;
        this.secretClickNum = 0;
        this.lastDateClickSecret = new Date();

        this.hasWin = false;
        this.startToMeetBoss = false;
        this.numberOfDestroyBoss = 0;

        let self = this;
        cc.director.getCollisionManager().enabled = true;

        this.score = 0;
        this.level = 0;

        this.addBackground();

        this.currentBgm = cc.audioEngine.playEffect(this.battleBgm, true, 0.5);

        this.spawnNewPlane();
        this.addTouchListener();

        this.spawnSmallEnemy();

        this.startSchedule();

        this.addSecretAction();
    },

    addSecretAction(){
        this.secretNode.on('click', (event)=>{
            let now = new Date();
            if(now.getTime() - this.lastDateClickSecret.getTime() >= 1000){
                this.secretClickNum = 1;
            }else{
                this.secretClickNum++;
            }
            console.log('secretClickNum: '+this.secretClickNum)
            if(this.secretClickNum >= 3){
                this.gotoWinResult();
            }
            this.lastDateClickSecret = now;
        });
    },

    start(){
        this.currentLevel = Global.enterLevel;
        this.updateBoomNum();
        Global.allPass && this.spawnNewEnemy();
    },

    startSchedule(){
        this.schedule(this.spawnSmallEnemy, 2);
        this.schedule(this.spawnUfo, 6);
    },

    cancelSchedule(){
        this.unschedule(this.spawnSmallEnemy);
        this.unschedule(this.spawnUfo);
    },

    addBackground: function(){
        let background = cc.instantiate(this.backgroundPrefab);
        this.node.addChild(background);
        this.background = background;

    },

    spawnNewPlane: function(){
        let self = this;
        let plane = cc.instantiate(this.planePrefab);

        this.node.addChild(plane);
        this.plane = plane;

        plane.setPosition(cc.p(0, -self.node.height / 2 + 200));
        plane.getComponent('Plane').game = this;

        this.updateHeroHp();
    },

    spawnNewEnemy: function(){
        if(this.hasWin) return;

        let self = this;
        let enemy = cc.instantiate(this.enemyPrefab);

        this.node.addChild(enemy);

        let posX = Math.floor(cc.randomMinus1To1() * (self.node.width / 2 - enemy.width / 2));
        let posY = Math.floor(self.node.height / 2 + enemy.height / 2 + cc.random0To1() * 100);

        enemy.setPosition(cc.p(posX, posY));
        enemy.getComponent('Enemy').game = this;

        let posY1 = Math.floor(cc.random0To1() * self.node.height / 2);

        let enterAction = cc.moveTo(10, cc.p(posX, posY1)).easing(cc.easeCubicActionOut());
        enemy.runAction(enterAction);
    },

    spawnSmallEnemy: function(){
        let allTypes = Global.SmallEnemyActionTypes;
        let type, count, canShoot, shootNum = 1, speedX = 0, hp = 5;
        let rand = cc.random0To1();
        if(rand <= 0.25){
            type = allTypes.defaultType;
            count = 3;
            canShoot = true;
        }else if(rand <= 0.5){
            type = allTypes.nineFall;
            count = 9;
            canShoot = false;
            hp = 2;
        }else if(rand <= 0.75){
            type = allTypes.pingpong;
            count = 3;
            canShoot = true;
            speedX = 400;
        }else{
            type = allTypes.bezierPath;
            count = 12;
            canShoot = true;
            hp = 5;
        }
        let index = Math.floor(cc.random0To1() * (this.smallEnemyPlanes.length - 1));
        let spriteFrame = this.smallEnemyPlanes[index];
        let bulletIndex = Math.floor(cc.random0To1() * (this.smallEnemyBulletSprites.length - 1));
        let bulletSpriteFrame = this.smallEnemyBulletSprites[bulletIndex];
        let enemySample = cc.instantiate(this.smallEnemyPrefab);
        let positions = this.getSmallEnemyPositions(type, count, enemySample);
        for(let i=0; i<count; i++){
            let enemy = cc.instantiate(this.smallEnemyPrefab);
            this.node.addChild(enemy);
            enemy.setPosition(positions[i]);
            let component = enemy.getComponent('SmallEnemy');
            component.game = this;
            let delay = 0;
            type == allTypes.bezierPath && (delay = 0.35 * Math.abs(i - count/2));
            component.updateActionTypeAndDelay(type, delay, canShoot, shootNum, speedX, hp, spriteFrame, bulletSpriteFrame);
        }
    },

    getSmallEnemyPositions(type, count, enemy){
        let width = this.node.width, height = this.node.height;
        let enemyHeight = enemy.height, enemyWidth = enemy.width;
        let allTypes = Global.SmallEnemyActionTypes;
        let arr = [];
        let posY = height/2 + enemyHeight/2;
        switch (type) {
            case allTypes.defaultType:
                arr = [
                    cc.p(-width/4, posY),
                    cc.p(0, posY),
                    cc.p(width/4, posY)
                ];
                break;
            case allTypes.nineFall:
                arr = [
                    cc.p(-width/4, posY),
                    cc.p(0, posY),
                    cc.p(width/4, posY),
                    cc.p(-width/4, posY + enemyHeight+20),
                    cc.p(0, posY + enemyHeight+20),
                    cc.p(width/4, posY + enemyHeight+20),
                    cc.p(-width/4, posY + (enemyHeight+20)*2),
                    cc.p(0, posY + (enemyHeight+20)*2),
                    cc.p(width/4, posY + (enemyHeight+20)*2)
                ];
                break;
            case allTypes.pingpong:
                let rand = cc.random0To1();
                let offset = enemyHeight + 10;
                let firstY = rand <= 0.5 ? posY + offset : posY;
                let secondY = rand<= 0.5 ? posY : posY + offset;
                arr = [
                    cc.p(-width/4, firstY),
                    cc.p(width/4, secondY)
                ];
            case allTypes.bezierPath:
                for(let i=0; i<count/2; i++) arr.push(cc.p(-width/2 - enemyWidth/2, height/2));
                for(let i=0; i<count/2; i++) arr.push(cc.p(width/2 + enemyWidth/2, height/2));
                break;
            default:
                break;
        }
        return arr;
    },

    spawnUfo: function(){
        let self = this;
        let rand = cc.random0To1();
        let ufo;
        if(rand <= 0.33){
            ufo = cc.instantiate(this.ufoBulletPrefab);
        }else if(rand <= 0.66){
            ufo = cc.instantiate(this.ufoBombPrefab);
        }else{
            ufo = cc.instantiate(this.shieldPrefab);
        }
        let posX = Math.floor(cc.randomMinus1To1() * (self.node.width / 2 - ufo.width / 2));
        let posY = Math.floor(self.node.height / 2 + ufo.height / 2);
        this.node.addChild(ufo);
        ufo.setPosition(cc.p(posX, posY));
        ufo.getComponent('Ufo').game = this;
    },

    _touchStartFunc: function(event){
        this.touch_flag = true;
    },

    _touchMoveFunc:  function(event){
        let self = this;
        if(self.touch_flag && self.plane){
            let delta = event.getDelta();

            self.plane.x += delta.x;
            self.plane.y += delta.y;

            let canvasWidth = self.node.width;
            let canvasHeight = self.node.height;

            let planeWidth = self.plane.width;
            let planeHeight = self.plane.height;

            if(self.plane.x >= canvasWidth / 2 - planeWidth/4){
                self.plane.x = canvasWidth / 2 - planeWidth/4;
            }

            if(self.plane.x <= -canvasWidth / 2 + planeWidth/4){
                self.plane.x = -canvasWidth / 2 + planeWidth/4;
            }

            // 血条多了30
            if(self.plane.y  >= canvasHeight / 2 - planeHeight / 2 - 30){
                self.plane.y = canvasHeight / 2 - planeHeight / 2 - 30;
            }

            if(self.plane.y <= -canvasHeight / 2 + planeHeight / 2){
                self.plane.y = -canvasHeight / 2 + planeHeight / 2;
            }
        }
    },

    _touchEndFunc: function(event){
        this.touch_flag = false;
    },

    _touchCancelFunc: function(event){
        this.touch_flag = false;
    },

    // 添加touch事件
    addTouchListener: function(){
        this.touchFlag = false;

        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartFunc, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveFunc, this);

        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEndFunc, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelFunc, this);
    },

    removeTouchListener: function(){

        this.node.off(cc.Node.EventType.TOUCH_START, this._touchStartFunc, this);

        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._touchMoveFunc, this);

        this.node.off(cc.Node.EventType.TOUCH_END, this._touchEndFunc, this);

        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelFunc, this);
    },

    gainScore: function(score){
        this.score += score;
        this.ui.scoreDisplay.string  = 'Score: ' + this.score.toString();
        if(score > 1){
            this.numberOfDestroyBoss++;
        }
    },

    updateHeroHp(){
        let component = this.plane.getComponent('Plane');
        let progress = component.remainHp / component.hp;
        this.ui.heroHp.progress = progress
        this.ui.heroHpLabel.string = '' + component.remainHp + '/' + component.hp;
        let color = cc.Color.GREEN;
        if(progress<=0.3){
            color = cc.Color.RED;
        }else if(progress <= 0.8){
            color = cc.Color.YELLOW;
        }
        this.ui.heroHpBar.color = color;
    },

    updateBoomNum: function(){
        this.ui.boomLabel.string = '' + Global.boomNum.toString();
    },

    useUfoBomb: function(){
        if(Global.boomNum <= 0){
            return;
        }
        this.useBombButton.interactable = false;
        this.scheduleOnce(()=>{
            this.useBombButton.interactable = true;
        }, 1);
        Global.boomNum--;
        if(Global.boomNum <= 0){
            Global.boomNum = 0;
        }
        this.updateBoomNum();

        let pos = [this.node.x - this.node.width/4, this.node.x + this.node.width/4];
        for(let i=0; i<2; i++){
          let effect = cc.instantiate(this.boomEffectPrefab);
          this.node.addChild(effect);
          effect.setPosition(pos[i], -this.node.height/2-effect.height/2);
          let action = cc.moveTo(1, cc.p(pos[i], this.node.height/2+effect.height/2));
          effect.runAction(action);
        }

        this.scheduleOnce(()=>{
            let children = this.node.children;
            for(let i=0; i<children.length; i++){
                if (children[i].name == 'smallEnemy'){
                    children[i].getComponent('SmallEnemy').hp = 0;
                }else if(children[i].name == 'Enemy'){
                    let enemy = children[i].getComponent('Enemy');
                    enemy.hp = enemy.hp - 10;
                }
            }
        }, 0.5);
    },

    gameOver: function(){
        this.removeTouchListener();
        this.cancelSchedule();
        // this.startToMeetBoss = false;

        this.scheduleOnce(()=>{
            this.ui.mask.node.active = true;
            this.ui.mask.status.string = '本次得分：'+ this.score.toString();
            this.ui.mask.surviveNum.string = '剩余复活次数：'+ this.surviveNum.toString();
            if(this.surviveNum == 0){
                this.ui.quiteButton.x = 0;
                this.ui.surviveButton.active = false;
            }

            this.updateScore();

            cc.audioEngine.pause(this.currentBgm);
            cc.director.pause();
        }, 1);
    },

    updateSurviveNumer() {
        this.surviveNum--;
        if (this.surviveNum <= 0 ){
            this.surviveNum = 0;
        }
    },

    updateScore() {
        Global.score = this.score;

        let scores = cc.sys.localStorage.getItem('scores');
        let scoresArr = scores ? JSON.parse(scores) : []
        if(scoresArr.length === 0) {
            scoresArr.push(this.score)
        } else {
            let inserted = false
            for(let i = 0; i < scoresArr.length; i++) {
                if (this.score >= scoresArr[i]) {
                    scoresArr.splice(i, 0, this.score)
                    inserted = true
                    break;
                }
            }
            if(!inserted) {
                scoresArr.push(this.score)
            }
        }
        cc.sys.localStorage.setItem('scores', JSON.stringify(scoresArr));
    },

    fuhuo(){
        this.updateSurviveNumer();
        this.spawnNewPlane();
        this.addTouchListener();
        this.hasWin = false;
        cc.audioEngine.resume(this.currentBgm);
        if(!this.startToMeetBoss){
            this.startSchedule();
        }
    },

    gotoWinResult: function(){
        Global.levels[Global.enterLevel+1] = true;
        this.removeTouchListener();
        this.cancelSchedule();
        Global.score = this.score;
        if(Global.enterLevel == 2){
            Global.allPass = true;
        }
        this.scheduleOnce(()=>{
            this.startToMeetBoss = false;
            cc.audioEngine.stop(this.currentBgm);
            cc.director.loadScene('result');
        }, 0.5);
    },

    fireBoom: function(posX, posY){
        let boom = cc.instantiate(this.boomPrefab);

        boom.x = posX;
        boom.y = posY;

        this.node.addChild(boom);
        boom.getComponent(cc.Animation).play('boom');
    },

    fireSmallBoom: function(index, posX, posY){
        let prefab = index==0 ? this.smallBoom1Prefab : this.smallBoom2Prefab;
        let boom = cc.instantiate(prefab);

        boom.x = posX;
        boom.y = posY;

        this.node.addChild(boom);
        boom.getComponent(cc.Animation).play('smallBoom'+(index+1));
    },

    fireBulletDeadEffect(posX, posY){
        let effect = cc.instantiate(this.bulletDeadEffectPrefab);
        this.node.addChild(effect);
        effect.setPosition(cc.p(posX, posY));
        effect.getComponent(cc.Animation).play('bulletDeadEffect');
    },

    update: function (dt) {
        if(!Global.allPass){
            if(!this.hasWin && !this.startToMeetBoss && this.score >= this.levels[this.currentLevel]){
                this.startToMeetBoss = true;
                this.cancelSchedule();
                this.spawnNewEnemy();
            }
            if(!this.hasWin && this.startToMeetBoss && this.numberOfDestroyBoss == this.bosses[this.currentLevel]){
                this.hasWin = true;
                this.gotoWinResult();
            }
        }
    },
});
