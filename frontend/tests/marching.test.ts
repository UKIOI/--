import {it,expect} from 'vitest';
import {Engine} from '../src/game/engine';
import config from '../../content/game-config.json';
const make=()=>{const e=new Engine(config,123,'march');e.s.nextBoss=e.s.nextEvent=e.s.nextPerk=999999;return e;};
const spawn=(e:Engine,type:string,x:number)=>{e.spawn(type,false,x);return e.s.enemies.at(-1)!;};
it('front troops and shields move every frame without waiting or retreating for formation',()=>{const e=make();spawn(e,'marshal',26);const shield=spawn(e,'reflector',24),front=spawn(e,'grunt',22),rear=spawn(e,'grunt',29);for(let i=0;i<300;i++){const old=[shield.x,front.x,rear.x];e.step();[shield,front,rear].forEach((a,j)=>expect(a.x).toBeLessThan(old[j]));}expect(Math.abs(rear.x-shield.x)).toBeLessThan(config.schedule.shieldCoverRadius);});
it('nearby troops without shields advance at normal speed with a commander',()=>{const e=make();spawn(e,'marshal',20);spawn(e,'grunt',21);const g=spawn(e,'grunt',21.1),x=g.x;e.step();expect(x-g.x).toBeCloseTo(config.enemies.grunt.speed/60);});
it('catch-up is bounded, respects frost and stops when commander dies',()=>{const e=make(),m=spawn(e,'marshal',25);spawn(e,'reflector',23);const g=spawn(e,'grunt',29);g.slows=[{amount:.5,until:100}];let x=g.x;e.step();const normal=config.enemies.grunt.speed/60*.5;expect(x-g.x).toBeGreaterThan(normal);expect(x-g.x).toBeLessThanOrEqual(normal*1.6+1e-9);m.hp=0;x=g.x;e.step();expect(x-g.x).toBeCloseTo(normal);});
it('marching resumes deterministically from a save',()=>{const e=make();spawn(e,'marshal',25);spawn(e,'reflector',23);spawn(e,'grunt',29);for(let i=0;i<60;i++)e.step();const copy=new Engine(config,1,'',e.snapshot());copy.paused=false;for(let i=0;i<180;i++){e.step();copy.step();}expect(copy.snapshot()).toEqual(e.snapshot());});
