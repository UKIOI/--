import {it,expect} from 'vitest';
import {Engine} from '../src/game/engine';
import {CoopGame} from '../src/game/coop';
import {battleAlert,battleWarning,prioritySound} from '../src/game/battle-alerts';
import {EVENTS} from '../src/game/incidents';
import config from '../../content/game-config.json';
const make=()=>new CoopGame(config,[{id:'a',name:'A',color:'#fff'},{id:'b',name:'B',color:'#eee'}],{mode:'endless',difficulty:'easy',stage:0},42);
it('all seven events use the same warnings and execute in cooperative play',()=>{
 for(const kind of Object.keys(EVENTS) as (keyof typeof EVENTS)[]){
  const g=make(),solo=new Engine(config,42);
  for(const e of [g.e,solo]){e.s.event={kind,remaining:2.2,columns:[10,16,22]};e.s.nextEvent=e.s.nextBoss=e.s.nextPerk=999999;}
  expect(battleAlert(g.e)).toEqual(battleAlert(solo));expect(battleAlert(g.e)?.title).toBe(EVENTS[kind].title);expect(battleAlert(g.e)?.detail).toContain('3 秒');
  g.e.s.event!.remaining=solo.s.event!.remaining=.001;g.step();solo.step();
  expect(g.e.s.event).toBeNull();expect(g.e.alert.title).toBe(EVENTS[kind].active);
  expect(g.e.s.shots.map(s=>s.visual)).toEqual(solo.s.shots.map(s=>s.visual));expect(g.e.s.enemies.map(e=>e.type)).toEqual(solo.s.enemies.map(e=>e.type));expect(!!g.e.s.crate).toBe(!!solo.s.crate);
 }
});
it('prioritizes bosses and current events, suppresses expired and cinematic broadcasts',()=>{
 const e=make().e;e.s.bossWarning=4.2;expect(battleAlert(e)?.detail).toContain('5 秒');e.s.event={kind:'meteor',remaining:8,columns:[10]};expect(battleAlert(e)?.title).toBe(EVENTS.meteor.title);
 e.s.event=null;e.s.bossWarning=-1;e.s.coreHp=800;expect(battleWarning(e)).toContain('核心生命危急');e.s.coreHp=3000;e.alert={title:'过期',detail:'',until:-1};expect(battleAlert(e)).toBeNull();
 e.s.campaign={stage:4,spawned:2,won:false,timelineVersion:3,revealFrame:0};expect(battleAlert(e)).toBeNull();expect(battleWarning(e)).toBe('');
});
it('keeps warnings audible over combat sounds without changing cinematic sound priority',()=>{
 expect(prioritySound(['drop','alarm','kill','gold'])).toBe('alarm');expect(prioritySound(['alarm','thunder'])).toBe('thunder');expect(prioritySound([])).toBeUndefined();
});
