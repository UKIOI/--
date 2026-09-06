export class OceanAudio {
 private rain?:AudioBufferSourceNode;private rainGain?:GainNode;
 constructor(private c:AudioContext,private output:AudioNode){}
 private noise(seconds:number){const b=this.c.createBuffer(1,Math.ceil(this.c.sampleRate*seconds),this.c.sampleRate),a=b.getChannelData(0);let last=0;for(let i=0;i<a.length;i++){last=(last+Math.random()*.12-.06)/1.02;a[i]=last*3;}return b;}
 storm(volume:number,active:boolean){if(!this.rain){const n=this.c.createBufferSource(),g=this.c.createGain(),f=this.c.createBiquadFilter();n.buffer=this.noise(3);n.loop=true;f.type='highpass';f.frequency.value=700;g.gain.value=0;n.connect(f);f.connect(g);g.connect(this.output);n.start();this.rain=n;this.rainGain=g;}this.rainGain!.gain.setTargetAtTime(active?volume*.32:0,this.c.currentTime,.4);}
 play(kind:string,volume:number){const t=this.c.currentTime,seconds=kind==='oceanSurge'?6:kind==='thunder'?5.5:2.5,n=this.c.createBufferSource(),f=this.c.createBiquadFilter(),g=this.c.createGain();n.buffer=this.noise(seconds);f.type='lowpass';f.frequency.setValueAtTime(kind==='hullCollision'?1400:650,t);f.frequency.exponentialRampToValueAtTime(90,t+seconds);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*(kind==='oceanSurge'?.6:.9)),t+(kind==='oceanSurge'?1.5:.05));g.gain.exponentialRampToValueAtTime(.0001,t+seconds);n.connect(f);f.connect(g);g.connect(this.output);n.start(t);n.stop(t+seconds);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};
  if(kind==='thunder'){
   // Several arriving pressure waves create a rolling rumble, not a single click.
   for(const [delay,hz,duration,level] of [[0,54,4.8,.2],[.28,81,3.6,.12],[.9,43,4.4,.22],[1.65,66,3.3,.12]]){
    const o=this.c.createOscillator(),v=this.c.createGain(),start=t+delay;o.type='sine';o.frequency.setValueAtTime(hz,start);o.frequency.exponentialRampToValueAtTime(hz*.55,start+duration);
    v.gain.setValueAtTime(.0001,start);v.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*level),start+.18);v.gain.exponentialRampToValueAtTime(.0001,start+duration);
    o.connect(v);v.connect(this.output);o.start(start);o.stop(start+duration);o.onended=()=>{o.disconnect();v.disconnect();};
   }
  }
  if(kind==='hullCollision')for(const hz of [53,87,173,293]){const o=this.c.createOscillator(),v=this.c.createGain();o.type='triangle';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.55,t+2);v.gain.setValueAtTime(volume*.12,t);v.gain.exponentialRampToValueAtTime(.0001,t+2.2);o.connect(v);v.connect(this.output);o.start(t);o.stop(t+2.3);o.onended=()=>{o.disconnect();v.disconnect();};}
 }
}
