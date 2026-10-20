/* HAIKYUU LEGENDS V22: self-contained 3D arena. No CDN, plugins or install required.
   True WebGL perspective, depth testing, articulated players and animated ball trajectories.
   Only the existing simulation determines points; this renderer visualises its actual event log.
*/
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.Spike3D=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const PI=Math.PI, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t;
 const zoneXY={1:[2.8,6],2:[2.8,2.55],3:[0,2.55],4:[-2.8,2.55],5:[-2.8,6],6:[0,6]};
 const positions=[[-2.95,2.6],[0,2.6],[2.95,2.6],[-2.95,6.0],[0,6.0],[2.95,6.0]];
 const xyzZone=(attackerSide,zone)=>{const p=zoneXY[Number(zone)]||zoneXY[4];return [p[0],.28,(attackerSide===0?-1:1)*p[1]];};
 const athleteXYZ=(side,index)=>{const p=positions[clamp(index,0,5)]||positions[0];return [p[0],0,(side===0?1:-1)*p[1]];};
 const zoneAtScreen=(u,v,attackerSide=0,mode='broadcast',aspect=16/9)=>{const eye=mode==='side'?[19,12,15]:mode==='top'?[.03,27,12]:[0,17,24];const cam=look(eye,[0,0,0]);const scaleY=Math.tan(44*PI/360);const sx=(u*2-1)*scaleY*aspect,sy=(1-v*2)*scaleY;const dir=norm(add(add(cam.front,scale(cam.right,sx)),scale(cam.up,sy)));if(dir[1]>=0)return null;const t=-cam.cam[1]/dir[1];const x=cam.cam[0]+dir[0]*t,z=cam.cam[2]+dir[2]*t;const positive=attackerSide===0?-1:1;if(Math.abs(x)>4.6||z*positive<.3||z*positive>9.2)return null;let min=Infinity,selected=null;for(let zone=1;zone<=6;zone++){const a=xyzZone(attackerSide,zone);const distance=(a[0]-x)**2+(a[2]-z)**2;if(distance<min){min=distance;selected=zone;}}return selected;};
 const normalizeEvent=e=>({winner:e?.winner??0,serve:e?.serve??0,action:e?.action||'',beats:Array.isArray(e?.beats)?e.beats:[],rally:e?.rally||0,choices:e?.choices||null});
 const cyan=[.11,.72,.98],ember=[1,.27,.23],line=[.85,.91,1],wood=[.52,.26,.13];
 const color=(a,b=1)=>a.map(v=>clamp(v*b,0,1)), len=v=>Math.hypot(...v), subtract=(a,b)=>a.map((v,i)=>v-b[i]), add=(a,b)=>a.map((v,i)=>v+b[i]), scale=(a,f)=>a.map(v=>v*f), norm=a=>scale(a,1/(len(a)||1));
 let obj=null, lastGame=null, prevRally=-1, raf=0, cameraMode='dynamic', tracking=false;
 const vShader=`attribute vec4 aClip;attribute vec3 aColor; varying vec3 vColor;void main(){gl_Position=aClip;vColor=aColor;}`;
 const fShader=`precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(pow(clamp(vColor,0.0,1.0),vec3(0.83)),1.0);}`;
 function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function init(){
  const canvas=document.createElement('canvas');canvas.className='v22-webgl';canvas.setAttribute('aria-label','3D volleyball match with twelve animated players and a moving ball');
  const gl=canvas.getContext('webgl',{antialias:true,alpha:false,depth:true,preserveDrawingBuffer:false});
  if(!gl)return {canvas,gl:null,label:null};
  const prog=gl.createProgram();gl.attachShader(prog,shader(gl,gl.VERTEX_SHADER,vShader));gl.attachShader(prog,shader(gl,gl.FRAGMENT_SHADER,fShader));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
  const buffer=gl.createBuffer();const aClip=gl.getAttribLocation(prog,'aClip'),aColor=gl.getAttribLocation(prog,'aColor');
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.025,.056,.105,1);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(obj)obj.gl=null;});
  canvas.addEventListener('click',e=>{if(!obj?.root||!obj?.targetMarker)return;const rect=canvas.getBoundingClientRect();const zone=zoneAtScreen((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height,obj.targetMarker.side,cameraMode,rect.width/Math.max(rect.height,1));if(zone)document.dispatchEvent(new CustomEvent('v22-aim',{detail:{zone}}));});

  return {canvas,gl,prog,buffer,aClip,aColor,label:null,root:null,match:null,playing:null,ball:[0,3,0],mvp:[],targetMarker:null,fallback:null,labels:null,marker:null};
 }
 function look(cam,target){const front=norm(subtract(target,cam)),right=norm([front[2]*-1,0,front[0]]); // right-handed camera
  // camera looks down negative Z, screen right points positive world X.
  const r=norm([front[2]*-1,0,front[0]]);const up=norm([r[1]*front[2]-r[2]*front[1],r[2]*front[0]-r[0]*front[2],r[0]*front[1]-r[1]*front[0]]);
  return {cam,front,right:r,up};}
 function camera(){
  if(cameraMode==='dynamic'&&obj?.playing&&obj.ball){
   const p=obj.ball;const x=clamp(p[0]*.25,-1.2,1.2),z=clamp(p[2]*.13,-1.2,1.2);
   return look([x,14.2,22.5+z],[p[0]*.20,1,p[2]*.10]);
  }
  return cameraMode==='side'?look([19,12,15],[0,0,0]):cameraMode==='top'?look([.03,27,12],[0,0,0]):look([0,17,24],[0,0,0]);
 }
 function project(p,cam,aspect){const d=subtract(p,cam.cam),z=d[0]*cam.front[0]+d[1]*cam.front[1]+d[2]*cam.front[2],x=d[0]*cam.right[0]+d[1]*cam.right[1]+d[2]*cam.right[2],y=d[0]*cam.up[0]+d[1]*cam.up[1]+d[2]*cam.up[2];const fov=Math.tan(44*PI/360);return [x/fov/aspect,y/fov,(100.2/99.8)*z-(40/99.8),z];}
 function drawFrame(time){
  if(!obj||!obj.root||!obj.root.isConnected){raf=0;return;}if(document.hidden){raf=requestAnimationFrame(drawFrame);return;}
  const fps=window.innerWidth<720?32:48;if(obj.lastFrame&&time-obj.lastFrame<1000/fps){raf=requestAnimationFrame(drawFrame);return;}obj.lastFrame=time;
  const w=Math.max(240,Math.round(obj.root.clientWidth)),h=Math.max(185,Math.round(obj.root.clientHeight));
  if(obj.canvas.width!==w||obj.canvas.height!==h){obj.canvas.width=w;obj.canvas.height=h;}
  const cam=camera(),aspect=w/h,verts=[],labels=[];let pos;const push=(p,c)=>{const v=project(p,cam,aspect);verts.push(...v,...c)};
  const tri=(a,b,c,col)=>{push(a,col);push(b,col);push(c,col)};
  const quad=(a,b,c,d,col)=>{tri(a,b,c,col);tri(a,c,d,col)};
  const box=(x,y,z,sx,sy,sz,col)=>{const x0=x-sx/2,x1=x+sx/2,y0=y-sy/2,y1=y+sy/2,z0=z-sz/2,z1=z+sz/2;
   quad([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],color(col,1.17));
   quad([x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],color(col,.95));
   quad([x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z0],color(col,.62));
   quad([x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[x1,y0,z0],color(col,.8));
   quad([x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1],color(col,.83));};
  const line3=(a,b,width,col)=>{const d=subtract(b,a);if(Math.abs(d[1])>.5){box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,Math.max(width,Math.abs(d[1])),width,col);return;}if(Math.abs(d[0])>=Math.abs(d[2]))box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,Math.abs(d[0])+width,width,width,col);else box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,width,Math.abs(d[2])+width,col);};
  const sphere=(center,r,col)=>{const rings=7,segs=10;for(let i=0;i<rings;i++){const a=i*PI/rings,b=(i+1)*PI/rings;for(let j=0;j<segs;j++){const c=j*PI*2/segs,d=(j+1)*PI*2/segs;
   const f=(theta,phi)=>[center[0]+r*Math.sin(theta)*Math.cos(phi),center[1]+r*Math.cos(theta),center[2]+r*Math.sin(theta)*Math.sin(phi)];
   const shade=(.65+.35*Math.cos(a))*(j%5===0?.91:1);quad(f(a,c),f(b,c),f(b,d),f(a,d),color(col,shade));}}};
  // Arena floor, glossy hardwood, and real 3D court boundaries.
  box(0,-.30,0,18,.30,27,[.035,.09,.18]);box(0,-.16,0,10,.25,19,color(wood,.65));
  for(let z=-9;z<9;z+=.65){const k=(Math.floor((z+9)/.65)%3);box(0,-.015,z+.325,9.0,.035,.647,[.40+k*.037,.21+k*.022,.115+k*.012]);}
  for(const x of [-4.51,4.51])line3([x,.075,-9],[x,.075,9],.075,line);
  for(const z of [-9,0,9,-3,3])line3([-4.5,.08,z],[4.5,.08,z],.065,z===0?[1,.69,.32]:line);
  // Decorative court glow and team-colour player circles.
  const roster=obj.match?.rosters||[[],[]],actorEvents=obj.playing?.event?.beats||[];
  const elapsed=obj.playing?((time-obj.playing.start)/obj.playing.duration):2;const at=clamp(elapsed,0,1);
  const currentBeat=obj.playing&&obj.playing.tracks.length?obj.playing.tracks[Math.min(obj.playing.tracks.length-1,Math.floor(at*obj.playing.tracks.length))]:null;
  let ball=[0,3.4,0],currentActor='';
  if(obj.playing&&at<1&&obj.playing.tracks.length){const i=Math.min(obj.playing.tracks.length-1,Math.floor(at*obj.playing.tracks.length)),seg=obj.playing.tracks[i],local=clamp(at*obj.playing.tracks.length-i,0,1);
   const ease=local*local*(3-2*local);ball=seg.from.map((v,n)=>mix(v,seg.to[n],ease));ball[1]+=Math.sin(PI*local)*(seg.peak||1.7);currentActor=seg.name;
  }else if(obj.playing?.tracks?.length){ball=obj.playing.tracks.at(-1).to.slice();}
  obj.ball=ball;
  // Net with posts and open mesh; tall poles behind boundaries.
  for(let x=-4.6;x<=4.6;x+=.46){line3([x,.17,0],[x,2.6,0],.014,[.70,.83,.92]);}
  for(let y=.23;y<=2.6;y+=.38){line3([-4.52,y,0],[4.52,y,0],.014,[.58,.72,.85]);}
  line3([-4.7,2.6,0],[4.7,2.6,0],.085,[1,1,1]);for(let x of [-4.7,4.7])line3([x,0,0],[x,3.2,0],.125,[.22,.53,.75]);
  // Grandstands, score light bars.
  for(let side of [-1,1]){for(let i=0;i<4;i++)box(side*(6+i*.8),.38+i*.37,0,.77,.45,23,[.025+i*.009,.055+i*.009,.12+i*.014]);}
  for(let side of [-1,1])for(let z=-11;z<=11;z+=1.4)box(side*9.1,.6,z,.3,.25,.35,(Math.round(z*3)%2)?[.11,.34,.49]:[.38,.19,.15]);
  // Flat target highlight, click-to-aim reflected in the 3D floor.
  if(obj.targetMarker){const zone=xyzZone(obj.targetMarker.side,obj.targetMarker.zone);box(zone[0],.067,zone[2],2.52,.05,2.4,[.04,.44,.78]);
   line3([zone[0]-1.25,.10,zone[2]-1.15],[zone[0]+1.25,.10,zone[2]-1.15],.13,[.35,.90,1]);line3([zone[0]-1.25,.10,zone[2]+1.15],[zone[0]+1.25,.10,zone[2]+1.15],.13,[.35,.90,1]);}
  const density=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:1;
  for(let side=0;side<2;side++)for(let i=0;i<6;i++){
   const [x,,z]=athleteXYZ(side,i),r=roster[side]?.[i]||{},tone=side?ember:cyan;
   const spike=(obj.playing&&at<1&&currentActor===r.name&&currentBeat&&['spike','block','dump','set'].includes(currentBeat.kind));
   const jump=spike?Math.sin(Math.PI*Math.min(1,(at*obj.playing.tracks.length)%1))*(currentBeat.kind==='spike'?1.25:.72):0;
   box(x,.045,z,1.07,.035,1.07,color(tone,.16));
   sphere([x,.23+jump,z],.15,[.10,.11,.15]);
   line3([x-.12,.24+jump,z],[x-.23,.82+jump,z],.18,[.13,.14,.21]);line3([x+.12,.24+jump,z],[x+.23,.82+jump,z],.18,[.13,.14,.21]);
   box(x,1.12+jump,z,.58,.88,.37,color(tone,1));
   sphere([x,1.80+jump,z],.28,[.93,.71,.57]);
   sphere([x,2.03+jump,z-.045],.22,[.095,.10,.14]);
   const armHigh=spike?(currentBeat.kind==='spike'?2.85:2.45):1.33;
   line3([x-.25,1.48+jump,z],[x-.51,spike?armHigh+jump:1.21+jump,z-.06],.20,[.84,.59,.43]);
   line3([x+.25,1.48+jump,z],[x+.51,spike?armHigh+jump:1.21+jump,z-.06],.20,[.84,.59,.43]);
   labels.push({p:[x,2.30+jump,z],label:(r.name||'PLAYER').split(' ').at(-1),rating:r.power||'',side});
  }
  // Physical volleyball with a moving shadow and luminous flight path.
  const shadowPos=[ball[0],.058,ball[2]];box(shadowPos[0],shadowPos[1],shadowPos[2],.45,.02,.45,[.07,.09,.14]);
  if(obj.playing&&at<1&&density){for(let i=1;i<=4;i++){let trail=scale(subtract(ball,obj.playing.tracks[0]?.from||[0,3,0]),i*.045);sphere(subtract(ball,trail),.11-i*.015,[.08+i*.07,.55,.95]);}}
  // Impact flare and action-dependent ball highlight on spike / block / dump.
  if(obj.playing&&at<1&&currentBeat&&['spike','dump','block'].includes(currentBeat.kind)&&density){
   const power=currentBeat.kind==='spike'?.55:.3;
   for(let j=0;j<5;j++){const theta=j*PI*2/5+time*.001;const r=.34+Math.sin(time*.014)*.06;
    sphere([ball[0]+Math.cos(theta)*r,ball[1]+Math.sin(theta)*r,ball[2]],.07+power*.045,[.95,.57,.20]);}}
  sphere(ball,.235,[.96,.91,.78]);sphere(add(ball,[.065,.035,.035]),.10,[.14,.48,.77]);
  if(obj.gl){const gl=obj.gl;gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(obj.prog);gl.bindBuffer(gl.ARRAY_BUFFER,obj.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.DYNAMIC_DRAW);
   gl.enableVertexAttribArray(obj.aClip);gl.vertexAttribPointer(obj.aClip,4,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(obj.aColor);gl.vertexAttribPointer(obj.aColor,3,gl.FLOAT,false,28,16);gl.drawArrays(gl.TRIANGLES,0,verts.length/7);
  }else if(obj.fallback){drawFallback(obj.fallback,w,h,labels,ball,obj.match);} // WebGL unavailable fallback.
  if(obj.labels){obj.labels.innerHTML='';const frag=document.createDocumentFragment();for(const x of labels){const p=project(x.p,cam,aspect);if(p[3]<=0)continue;const el=document.createElement('span');el.className='v22-player-tag '+(x.side?'opponent':'ally');el.textContent=x.label+' '+x.rating;el.style.cssText=`left:${(p[0]/p[3]*.5+.5)*100}%;top:${(-p[1]/p[3]*.5+.5)*100}%`;frag.append(el);}obj.labels.append(frag);}
  if(obj.playing&&at>=1){obj.playing=null;const label=obj.root.querySelector('.v22-move-label');if(label)label.textContent=obj.match?.events?.at(-1)?.action||'POINT SCORED';}
  raf=requestAnimationFrame(drawFrame);
 }
 function drawFallback(canvas,w,h,labels,ball,match){const ctx=canvas.getContext('2d');if(!ctx)return;canvas.width=w;canvas.height=h;ctx.fillStyle='#082036';ctx.fillRect(0,0,w,h);ctx.fillStyle='#a77548';ctx.beginPath();ctx.moveTo(w*.28,h*.23);ctx.lineTo(w*.72,h*.23);ctx.lineTo(w*.96,h*.94);ctx.lineTo(w*.04,h*.94);ctx.fill();ctx.strokeStyle='#dbeefa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.12,h*.69);ctx.lineTo(w*.88,h*.69);ctx.moveTo(w*.20,h*.44);ctx.lineTo(w*.80,h*.44);ctx.stroke();for(let [i,x] of labels.entries()){const p=project(x.p,camera(),w/h);const px=(p[0]/p[3]*.5+.5)*w,py=(-p[1]/p[3]*.5+.5)*h;ctx.fillStyle=x.side?'#ff6558':'#57c9ff';ctx.beginPath();ctx.arc(px,py,9,0,PI*2);ctx.fill();}const p=project(ball,camera(),w/h);ctx.fillStyle='#fff9d0';ctx.beginPath();ctx.arc((p[0]/p[3]*.5+.5)*w,(-p[1]/p[3]*.5+.5)*h,8,0,PI*2);ctx.fill();}
 function setupTracks(event,rosters){const beats=normalizeEvent(event).beats;const tracks=[];let from=[0,3,0];const lookup=(side,name)=>{const team=rosters?.[side]||[];const i=team.findIndex(x=>x.name===name);return i<0?athleteXYZ(side,2):athleteXYZ(side,i);};
  for(let i=0;i<beats.length;i++){const b=beats[i],isAttack=['serve','spike','dump'].includes(b.kind),t=lookup(b.side,b.name),dest=isAttack?xyzZone(b.side,b.zone):[t[0],b.kind==='dig'?.7:1.8,t[2]];
   if(i===0)from=[t[0],2.4,t[2]];
   tracks.push({from:from.slice(),to:dest,peak:b.kind==='serve'?2.0:b.kind==='spike'?.95:1.65,name:b.name,kind:b.kind,zone:b.zone,side:b.side});from=dest.slice();}
  if(!tracks.length){const attacking=event?.serve||0;tracks.push({from:[0,2.6,attacking? -6:6],to:xyzZone(attacking,4),peak:2,kind:'serve',name:'PLAYER'});}return tracks;
 }
 function mount(container,match){if(!container||typeof document==='undefined')return;
  if(!obj)try{obj=init();}catch(err){console.warn('WebGL init failed',err);obj={canvas:document.createElement('canvas'),gl:null};}
  obj.root=container;obj.match=match;container.prepend(obj.canvas);
  let labels=container.querySelector('.v22-labels');if(!labels){labels=document.createElement('div');labels.className='v22-labels';container.append(labels);}obj.labels=labels;
  if(!obj.gl){obj.fallback=obj.canvas;obj.canvas.className='v22-webgl v22-fallback';}
  const zone=match?.aim?.serveZone;
  const phase=match?.type==='bot'?match?.phaseList?.[match.phaseIndex]:match?.pendingPhase;
  obj.targetMarker=(phase==='serve'||phase==='attack')?{side:match?.type==='live'?(match?.playingSide??0):0,zone:match?.aim?.[phase==='serve'?'serveZone':'attackZone']||4}:null;
  const event=match?.events?.at(-1);
  if(event&&prevRally!==match.rally){prevRally=match.rally;const tracks=setupTracks(event,match.rosters);obj.playing={start:performance.now(),duration:Math.min(3900,Math.max(1650,tracks.length*650)),tracks,event};const s=container.querySelector('.v22-move-label');if(s)s.textContent='🏐 '+(event.action||'LIVE RALLY');}
  if(!raf)raf=requestAnimationFrame(drawFrame);
 }
 function unmount(){if(obj){obj.root=null;obj.labels=null;obj.canvas?.remove();obj.playing=null;}if(raf){cancelAnimationFrame(raf);raf=0;}prevRally=-1;}
 function setCamera(mode){if(['dynamic','broadcast','side','top'].includes(mode))cameraMode=mode;return cameraMode;}
 function getCamera(){return cameraMode;}
 return {mount,unmount,setCamera,getCamera,zoneXY,zoneAtScreen,xyzZone,athleteXYZ,normalizeEvent,setupTracks};
});
