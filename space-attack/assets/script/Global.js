var Material = {
    wood: 'wood',
    silver: 'silver',
    gold: 'gold'
};

var levelPrizeStatus = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
];

var allPlaneNames = [
  '鲁班号',
  '战神号',
  '希望号',
  '未来号',
  '猎鹰号',
  '飞鸟号',
];

var SmallEnemyActionTypes = {
  defaultType: 'default',
  nineFall: 'nineFall',
  bezierPath: 'bezierPath',
  pingpong: 'pingpong',
};

module.exports = {
    currentLevel: 0,
    enterLevel: 0,
    levels:[true, true, true],
    boomNum: 0,
    score: 0,
    gameBg: 'huoShan',
    Material,
    diamond: 0,
    vip: false,
    levelPrizeStatus,
    shield: 0,
    allPass: true,
    selectedPlaneNum: 0,
    allPlaneNames,
    SmallEnemyActionTypes,
};
