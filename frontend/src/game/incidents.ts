export const EVENTS={
 supply:{title:'军械箱投放 / 前线回收',detail:'第 21 列军械箱即将降落 · 附近建造并清除敌人，守护回收可获金币与强化',active:'军械箱抵达 / 争取战术补给',label:'军械箱'},
 missiles:{title:'导弹齐射 / 锁定警报',detail:'敌方发射阵地已锁定 · 标记区域即将遭受轰炸',active:'导弹来袭 / 注意落点',label:'轰炸'},
 airdrop:{title:'空降入侵 / 空域警报',detail:'防空塔可拦截降落单位 · 落地后切换地面火力',active:'空降开始 / 拦截运输伞',label:'空降'},
 meteor:{title:'陨石雨 / 撞击预警',detail:'陨石即将撞击标记区域 · 加固上层或回收危险建筑',active:'陨石来袭 / 顶层承受冲击',label:'陨石'},
 breach:{title:'地底裂隙 / 虫群预警',detail:'标记阵地下方发生破土冲击，并钻出跃袭兽和酸液虫 · 转移关键设施，调整地面火力',active:'裂隙开启 / 地面虫群突袭',label:'裂隙'},
 sabotage:{title:'矿区爆破 / 经济设施锁定',detail:'标记列的矿场将在倒计时结束后遭到地下爆破 · 可提前回收并分散重建',active:'矿区爆破 / 检查生产损失',label:'矿场爆破'},
 siege:{title:'精英空投 / 重装突袭',detail:'护盾重装虫与飞行虫即将进入标记空域 · 同时准备防空与地面火力',active:'精英空投 / 混合部队入侵',label:'精英空投'}
} as const;
