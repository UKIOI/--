import {it,expect} from 'vitest';
import {invitationLinks} from '../src/game/lan-address';
it('replaces local-only addresses with LAN interfaces and retains port and room',()=>{
 for(const host of ['127.0.0.1','localhost','[::1]','0.0.0.0'])expect(invitationLinks(`http://${host}:8011`,'2B6982',['127.0.0.1','10.31.20.53'])).toEqual(['http://10.31.20.53:8011/?lan=2B6982']);
});
it('never offers loopback when interface detection fails; preserves an explicit reachable server',()=>{
 expect(invitationLinks('http://127.0.0.1:8000','ABCDEF',[])).toEqual([]);
 expect(invitationLinks('http://192.168.43.20:8000/old?foo=1','ABCDEF',['10.0.0.1'])).toEqual(['http://192.168.43.20:8000/?lan=ABCDEF']);
});
