/** Procedural wind, fortress machinery, minor-key pads and a slow warning pulse. */
export class Ambience {
 private master:GainNode;private pulse:GainNode;private next=0;private beat=0;
 constructor(private c:AudioContext){
  this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
  for(const [frequency,volume] of [[55,.035],[110,.022],[130.813,.016],[164.814,.013]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.value=volume;o.connect(g);g.connect(this.master);o.start();}
  const buffer=c.createBuffer(1,c.sampleRate*8,c.sampleRate),data=buffer.getChannelData(0);let seed=73,smoothed=0;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;smoothed=smoothed*.975+(seed/4294967296*2-1)*.025;data[i]=smoothed*Math.min(1,i/3000,(data.length-i)/3000);}
  const wind=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();wind.buffer=buffer;wind.loop=true;filter.type='lowpass';filter.frequency.value=650;gain.gain.value=.45;wind.connect(filter);filter.connect(gain);gain.connect(this.master);wind.start();
  const sway=c.createOscillator(),swayGain=c.createGain();sway.frequency.value=.08;swayGain.gain.value=180;sway.connect(swayGain);swayGain.connect(filter.frequency);sway.start();
  this.pulse=c.createGain();this.pulse.gain.value=.07;this.pulse.connect(this.master);
 }
 update(volume:number,running:boolean){const c=this.c;this.master.gain.setTargetAtTime(running?volume:0,c.currentTime,.12);if(!running){this.next=0;return;}if(c.currentTime<this.next)return;
  this.next=c.currentTime+1.8;const notes=[220,0,261.626,0,329.628,293.665,0,196];const frequency=notes[this.beat++%notes.length];if(!frequency)return;
  const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.3,c.currentTime+.12);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+1.6);o.connect(g);g.connect(this.pulse);o.start();o.stop(c.currentTime+1.65);o.onended=()=>{o.disconnect();g.disconnect();};
 }
}
