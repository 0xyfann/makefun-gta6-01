export const CONTRACTS=[
 {title:'Quiet Entry',copy:'Reach the amber marker. Keep the streets calm.',target:{x:750,y:730},reward:450},
 {title:'Borrowed Wheels',copy:'Take the courier van at Neon Market.',target:{x:750,y:730},reward:700},
 {title:'Waterline Drop',copy:'Drive the package to Harbor Gate.',target:{x:1068,y:1300},reward:900},
 {title:'Heat Check',copy:'Lose the patrol before the signal expires.',target:{x:430,y:1300},reward:1200},
 {title:'Home Frequency',copy:'Return to Canal House. The city is yours.',target:{x:430,y:1300},reward:2400}
];
export function missionState(scene){if(scene==='mission')return 2;if(scene==='chase')return 3;return 0}
export function missionLabel(n){return String(n+1).padStart(2,'0')+' / 05'}
export function advanceMission(state){if(state.stage<CONTRACTS.length-1){state.stage++;state.reward+=CONTRACTS[state.stage-1].reward;return true}state.complete=true;state.reward+=CONTRACTS[4].reward;return true}
export function isNearTarget(player,target){return Math.hypot(player.x-target.x,player.y-target.y)<70}
export function missionBlurb(state){if(state.complete)return {title:'City Acquired',copy:'You made a name in Harbor City. Roam free.'};return CONTRACTS[state.stage]}
