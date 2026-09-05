// Fixed pre-balance numeric fixture for mechanics; balance.test.ts exercises current data.
import {it,expect} from 'vitest';
import {shellPath,mortarLaunch} from '../src/game/trajectory';
it('shell leaves the muzzle and reaches the locked point on a curved path',()=>{const origin=mortarLaunch(10,.5,18,.4),shot={...origin,x:18,y:.4};expect(shellPath(shot,0).x).toBe(origin.originX);expect(shellPath(shot,0).y).toBe(origin.originY);expect(shellPath(shot,1).x).toBe(18);expect(shellPath(shot,1).y).toBeCloseTo(.4);expect(shellPath(shot,.5).y).toBeGreaterThan(origin.originY+1);expect(shellPath(shot,0).angle).toBeGreaterThan(0);expect(shellPath(shot,1).angle).toBeLessThan(0);expect(shellPath(JSON.parse(JSON.stringify(shot)),.4)).toEqual(shellPath(shot,.4));});
