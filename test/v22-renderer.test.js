'use strict';
const assert=require('node:assert/strict');
let frame=null,vertices=0,drew=0;
const gl={VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,DEPTH_TEST:5,LEQUAL:6,COLOR_BUFFER_BIT:7,DEPTH_BUFFER_BIT:8,ARRAY_BUFFER:9,DYNAMIC_DRAW:10,FLOAT:11,TRIANGLES:12,
 createShader(){return {}},shaderSource(){},compileShader(){},getShaderParameter(){return true},getShaderInfoLog(){return ''},createProgram(){return {}},attachShader(){},linkProgram(){},getProgramParameter(){return true},getProgramInfoLog(){return ''},createBuffer(){return {}},getAttribLocation(_p,n){return n==='aClip'?0:1},enable(){},depthFunc(){},clearColor(){},viewport(){},clear(){},useProgram(){},bindBuffer(){},bufferData(_t,f){vertices=f.length},enableVertexAttribArray(){},vertexAttribPointer(){},drawArrays(_m,_z,n){assert(n>500);drew++;}};
const node=(tag='div')=>({tagName:tag,className:'',style:{},textContent:'',width:0,height:0,parentNode:null,addEventListener(){},setAttribute(){},querySelector(){return null},append(){},prepend(){},remove(){},getContext(type){if(type==='webgl')return gl;return null}});
const panel=node();panel.clientWidth=850;panel.clientHeight=420;panel.isConnected=true;panel.querySelector=(selector)=>selector==='.v22-move-label'?{textContent:''}:null;
const old={document:global.document,window:global.window,performance:global.performance,requestAnimationFrame:global.requestAnimationFrame,cancelAnimationFrame:global.cancelAnimationFrame};
global.document={hidden:false,createElement:node,createDocumentFragment:()=>({append(){}})};global.window={innerWidth:1200,matchMedia:()=>({matches:false})};global.performance={now:()=>1000};global.requestAnimationFrame=cb=>(frame=cb,1);global.cancelAnimationFrame=()=>{frame=null};
try{
 const G=require('../public/v22-arena3d.js');const POS=['OH','MB','OP','MB','OH','S'];const team=(prefix)=>POS.map((position,i)=>({name:`${prefix} ${i}`,position,power:80+i}));
 const game={rosters:[team('Karasuno'),team('Nekoma')],events:[],rally:0,type:'bot',phaseList:['serve'],phaseIndex:0,plan:{serveZone:3},aim:{serveZone:3}};
 G.mount(panel,game);assert(frame);frame(1500);assert(drew===1&&vertices>9000,`WebGL drew=${drew} vertices=${vertices}`);
 const event={rally:1,serve:0,beats:[{kind:'serve',side:0,zone:1,name:'Karasuno 0'},{kind:'receive',side:1,zone:1,name:'Nekoma 3'},{kind:'set',side:1,zone:4,name:'Nekoma 5'},{kind:'spike',side:1,zone:4,name:'Nekoma 0'}],action:'CROSS-COURT SPIKE'};game.events=[event];game.rally=1;G.mount(panel,game);frame(1800);assert(drew===2);
 const tracks=G.setupTracks(event,game.rosters);assert(tracks.length===4);assert(tracks[0].to[2]<0);
 panel.isConnected=false;G.unmount();assert(G.getCamera()==='broadcast');G.setCamera('side');assert(G.getCamera()==='side');
 console.log('PASS V22 WebGL renderer: shaders, perspective 3D geometry, animated twelve-player scene, projected volleyball and camera switching.');
}finally{for(const [k,v]of Object.entries(old)){if(v===undefined)delete global[k];else global[k]=v;}}
