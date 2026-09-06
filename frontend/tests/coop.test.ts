import {it,expect} from 'vitest';
import {CoopGame} from '../src/game/coop';
import config from '../../content/game-config.json';
const players=[{id:'a',name:'A',color:'#77ddff'},{id:'b',name:'B',color:'#ffc56e'}];
const make=()=>new CoopGame(config,players,{mode:'endless',difficulty:'easy',stage:0},42);
it('separates funds, ownership and deployment cooldown, rejects another player’s commands',()=>{
 const g=make(),[a,b]=g.e.s.coop!.players,initial=a.gold;
 expect(g.apply('a',{type:'drop',kind:'wall',column:8})).toBe('');
 expect(g.apply('b',{type:'drop',kind:'wall',column:9})).toBe('');
 expect(a.gold).toBe(initial-config.buildings.wall.cost);expect(b.gold).toBe(a.gold);
 expect(g.e.s.buildings.map(b=>b.owner)).toEqual(['a','b']);
 expect(g.apply('b',{type:'upgrade',id:1,branch:0})).toContain('自己的');
 expect(g.apply('b',{type:'demolish',id:1})).toContain('自己的');
 expect(g.apply('b',{type:'relocate',id:1,column:10})).toContain('自己的');
 expect(g.apply('a',{type:'drop',kind:'wall',column:10})).toContain('冷却');
});
it('allocates mine gold to the owner, team rewards equally and passive income per player',()=>{
 const g=make(),[a,b]=g.e.s.coop!.players,initial=a.gold;
 g.e.creditGold(100,'a');expect(a.gold).toBe(initial+100);expect(b.gold).toBe(initial);
 g.e.creditGold(80);expect(a.gold).toBe(initial+140);expect(b.gold).toBe(initial+40);
 g.e.creditGold(1000,undefined,true);expect(a.gold).toBe(initial+1140);expect(b.gold).toBe(initial+1040);
 g.apply('a',{type:'drop',kind:'mine',column:8});const mine=g.e.s.buildings[0];mine.y=.5;mine.v=0;mine.settled=true;mine.cooldown=0;const beforeA=a.gold,beforeB=b.gold;g.step();expect(a.gold).toBeGreaterThan(beforeA);expect(b.gold).toBe(beforeB);
});
it('removes owned building after 0.3 seconds and never funds a different wallet',()=>{
 const g=make();g.apply('a',{type:'drop',kind:'wall',column:8});const b=g.e.s.buildings[0];b.y=.5;b.v=0;b.settled=true;const [a,p]=g.e.s.coop!.players,old=a.gold,other=p.gold;
 g.apply('a',{type:'demolish',id:b.id});for(let i=0;i<17;i++)g.step();expect(b.hp).toBeGreaterThan(0);g.step();expect(b.hp).toBe(0);expect(a.gold).toBeGreaterThan(old);expect(p.gold).toBe(other);
});
it('supports every mode and scales enemies while keeping per-owner firing orders',()=>{
 for(const mode of ['endless','test','campaign'] as const)for(const stage of mode==='campaign'?[0,1,2,3,4]:[0]){
  const g=new CoopGame(config,players,{mode,difficulty:'easy',stage},42);g.e.spawn('grunt',false);const enemy=g.e.s.enemies[0];expect(enemy.maxHp).toBeGreaterThanOrEqual(config.enemies.grunt.hp*(mode==='campaign'?1.35:1.65));expect(g.e.coopRate).toBe(mode==='campaign'?1.15:1.35);if(mode==='campaign')expect(g.e.s.campaign?.stage).toBe(stage);if(mode==='test')expect(g.e.s.testMode).toBe(true);
 }
 const g=make();g.apply('a',{type:'drop',kind:'ballista',column:8});g.apply('b',{type:'aim',ids:[1],x:10,y:1,fire:true});expect(g.e.coopOrders.b.ids).toEqual([]);g.apply('a',{type:'aim',ids:[1],x:10,y:1,fire:true});expect(g.e.coopOrders.a.ids).toEqual([1]);
});

it('reserves decoy construction for the explicit host in every cooperative mode',()=>{
 for(const mode of ['endless','test','campaign'] as const){
  const g=new CoopGame(config,[...players].reverse(),{mode,difficulty:'easy',stage:2},42,'a');
  const guest=g.e.s.coop!.players.find(p=>p.id==='b')!,host=g.e.s.coop!.players.find(p=>p.id==='a')!;
  guest.gold=host.gold=1000;
  expect(g.apply('b',{type:'drop',kind:'decoy',column:8})).toBe('投影塔仅房主可建造');
  expect(guest.gold).toBe(1000);expect(guest.cooldown).toBe(0);expect(g.e.s.buildings).toHaveLength(0);
  expect(g.apply('a',{type:'drop',kind:'decoy',column:8})).toBe('');
  expect(g.e.s.buildings[0].owner).toBe('a');expect(host.gold).toBe(1000-config.buildings.decoy.cost);
  host.cooldown=0;
  expect(g.apply('a',{type:'drop',kind:'decoy',column:10})).toContain('上限');
 }
 const early=new CoopGame(config,players,{mode:'campaign',difficulty:'easy',stage:0},42,'a');
 expect(early.apply('a',{type:'drop',kind:'decoy',column:8})).toContain('未在本关解锁');
});
