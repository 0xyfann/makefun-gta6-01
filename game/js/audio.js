// Create the audio graph lazily when a user gesture unlocks playback.
let context=null,master=null,engine=null,siren=null,melodyClock=0;
export function unlockAudio(){
  if(!context){
    context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=.09;master.connect(context.destination);
    engine=context.createOscillator();engine.type='sawtooth';engine.gain=context.createGain();engine.gain.gain.value=0;engine.connect(engine.gain).connect(master);engine.start();
    siren=context.createOscillator();siren.type='sine';siren.gain=context.createGain();siren.gain.gain.value=0;siren.connect(siren.gain).connect(master);siren.start();
  }
  if(context.state==='suspended')context.resume();
}
export function toggleAudio(state){state.muted=!state.muted;if(master)master.gain.value=state.muted?0:.09;state.toast=state.muted?'Sound off':'Sound on • Port Aurelia FM';}
export function playTone(freq=440,duration=.1){
  if(!context)return;const o=context.createOscillator(),g=context.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.3,context.currentTime);g.gain.exponentialRampToValueAtTime(.001,context.currentTime+duration);o.connect(g).connect(master);o.start();o.stop(context.currentTime+duration);
}
export function updateAudio(state,dt){
  if(!context)return;
  engine.frequency.setTargetAtTime(35+Math.abs(state.player.car?.speed||0)*.36,context.currentTime,.08);
  engine.gain.gain.setTargetAtTime(state.player.car&&!state.paused?.13:0,context.currentTime,.1);
  siren.frequency.value=650+Math.sin(state.time*5)*260;siren.gain.gain.value=state.wanted&&!state.paused?.16:0;
  melodyClock+=dt;
  if(melodyClock>1&&!state.paused){melodyClock=0;const notes=[164.81,196,246.94,220,146.83,196,220,185];playTone(notes[Math.floor(state.time)%notes.length],.65);}
}
