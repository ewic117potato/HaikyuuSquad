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
 const zoneAtCamera=(u,v,attackerSide,cam,aspect)=>{
  const scaleY=Math.tan(44*PI/360),sx=(u*2-1)*scaleY*aspect,sy=(1-v*2)*scaleY;
  const dir=norm(add(add(cam.front,scale(cam.right,sx)),scale(cam.up,sy)));
  if(dir[1]>=-.0001)return null;const t=-cam.cam[1]/dir[1];
  const x=cam.cam[0]+dir[0]*t,z=cam.cam[2]+dir[2]*t;
  const positive=attackerSide===0?-1:1;
  if(Math.abs(x)>4.65||z*positive<.25||z*positive>9.3)return null;
  let min=Infinity,selected=null;
  for(let zone=1;zone<=6;zone++){
   const a=xyzZone(attackerSide,zone),distance=(a[0]-x)**2+(a[2]-z)**2;
   if(distance<min){min=distance;selected=zone;}
  }return selected;
 };
 const zoneAtScreen=(u,v,attackerSide=0,mode='broadcast',aspect=16/9)=>{
  const eye=mode==='side'?[22,12,10]:mode==='top'?[.04,28,11]:[11.5,14.8,20.2];
  return zoneAtCamera(u,v,attackerSide,look(eye,[0,1,0]),aspect);
 };
 const normalizeEvent=e=>({winner:e?.winner??0,serve:e?.serve??0,action:e?.action||'',beats:Array.isArray(e?.beats)?e.beats.map(b=>({...b})):[],rally:e?.rally||0,choices:e?.choices||null});
 const cyan=[.11,.72,.98],ember=[1,.27,.23],line=[.92,.96,1],wood=[.65,.38,.21];
 const color=(a,b=1)=>a.map(v=>clamp(v*b,0,1)), len=v=>Math.hypot(...v), subtract=(a,b)=>a.map((v,i)=>v-b[i]), add=(a,b)=>a.map((v,i)=>v+b[i]), scale=(a,f)=>a.map(v=>v*f), norm=a=>scale(a,1/(len(a)||1));
 let obj=null, lastGame=null, prevRally=-1, raf=0, cameraMode='cinematic', tracking=false;
 const vShader=`attribute vec4 aClip;attribute vec3 aColor; varying vec3 vColor;void main(){gl_Position=aClip;vColor=aColor;}`;
 const fShader=`precision mediump float;varying vec3 vColor;void main(){vec3 c=clamp(vColor,0.0,1.0);gl_FragColor=vec4(pow(c,vec3(0.82)),1.0);}`;
 function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function init(){
  const canvas=document.createElement('canvas');canvas.className='v22-webgl';canvas.setAttribute('aria-label','3D volleyball match with twelve animated players and a moving ball');
  const gl=canvas.getContext('webgl',{antialias:true,alpha:false,depth:true,preserveDrawingBuffer:false});
  if(!gl)return {canvas,gl:null,label:null};
  const prog=gl.createProgram();gl.attachShader(prog,shader(gl,gl.VERTEX_SHADER,vShader));gl.attachShader(prog,shader(gl,gl.FRAGMENT_SHADER,fShader));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
  const buffer=gl.createBuffer();const aClip=gl.getAttribLocation(prog,'aClip'),aColor=gl.getAttribLocation(prog,'aColor');
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.025,.056,.105,1);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(obj)obj.gl=null;});
  canvas.addEventListener('click',e=>{if(!obj?.root||!obj?.targetMarker)return;const rect=canvas.getBoundingClientRect();const zone=zoneAtCamera((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height,obj.targetMarker.side,obj.lastCamera||look([11.5,14.8,20.2],[0,1,0]),rect.width/Math.max(rect.height,1));if(zone)document.dispatchEvent(new CustomEvent('v22-aim',{detail:{zone}}));});

  return {canvas,gl,prog,buffer,aClip,aColor,label:null,root:null,match:null,playing:null,ball:[0,3,0],mvp:[],targetMarker:null,fallback:null,labels:null,marker:null};
 }
 function look(cam,target){const front=norm(subtract(target,cam)),right=norm([front[2]*-1,0,front[0]]); // right-handed camera
  // camera looks down negative Z, screen right points positive world X.
  const r=norm([front[2]*-1,0,front[0]]);const up=norm([r[1]*front[2]-r[2]*front[1],r[2]*front[0]-r[0]*front[2],r[0]*front[1]-r[1]*front[0]]);
  return {cam,front,right:r,up};}
 function camera(actor=null,beat=null,progress=0){
  if(cameraMode==='side')return look([22,12,10],[0,1.0,0]);
  if(cameraMode==='top')return look([.04,28,11],[0,.8,0]);
  if(cameraMode==='broadcast'||!obj?.playing||!actor)return look([11.5,14.8,20.2],[0,1,0]);
  const phase=beat?.kind||'serve',side=beat?.side||0,zSign=side===0?1:-1;
  let eye,target;
  // Establishing, anticipation, impact and follow-through are separate camera beats.
  // Don't keep the lens glued to one player: the viewer must be able to read the rally.
  if(progress>.71){
   eye=[7.5,9.5,side===0?13:-13];target=[obj.ball?.[0]||0,Math.min(3.5,(obj.ball?.[1]||2)),obj.ball?.[2]||0];
  }else if(progress<.17){
   eye=[8.6,11.6,side===0?16:-16];target=[actor[0],1.7,actor[2]*.48];
  }else if(phase==='serve'){
   eye=[actor[0]+4.2,3.9,actor[2]+zSign*5.4];target=[actor[0],2.0,actor[2]-zSign*1.0];
  }else if(phase==='dig'||phase==='receive'){
   eye=[actor[0]+5.1,3.3,actor[2]+zSign*5.6];target=[actor[0],1.5,actor[2]];
  }else if(phase==='set'){
   eye=[actor[0]+5.7,5.2,actor[2]+zSign*6.8];target=[actor[0],2.2,actor[2]-zSign*1.1];
  }else if(phase==='spike'||phase==='dump'){
   eye=[actor[0]+4.2,4.4,actor[2]+zSign*5.9];target=[actor[0],2.5,actor[2]-zSign*.9];
  }else{
   eye=[13,7,side?-9:9];target=[actor[0],1.8,actor[2]];
  }
  // Camera positions are animated smoothly between serve, receive, set, spike and block.
  if(!obj.camEye){obj.camEye=eye.slice();obj.camTarget=target.slice();}
  const smooth=1-Math.exp(-(obj.frameDelta||20)/180);
  obj.camEye=obj.camEye.map((v,i)=>mix(v,eye[i],smooth));
  obj.camTarget=obj.camTarget.map((v,i)=>mix(v,target[i],smooth));
  return look(obj.camEye,obj.camTarget);
}
 function project(p,cam,aspect){const d=subtract(p,cam.cam),z=d[0]*cam.front[0]+d[1]*cam.front[1]+d[2]*cam.front[2],x=d[0]*cam.right[0]+d[1]*cam.right[1]+d[2]*cam.right[2],y=d[0]*cam.up[0]+d[1]*cam.up[1]+d[2]*cam.up[2];const fov=Math.tan(44*PI/360);return [x/fov/aspect,y/fov,(100.2/99.8)*z-(40/99.8),z];}
 // Ball contact happens at 38% of a beat; flight starts only after the touch.
 function flightPoint(seg,phase){
  const t=clamp((phase-.38)/.62,0,1),p=seg.from.map((v,i)=>mix(v,seg.to[i],t));
  p[1]+=4*t*(1-t)*(seg.peak||1.3);
  if(phase<.38&&seg.kind==='serve')p[1]-=Math.sin((1-phase/.38)*PI/2)*1.25;
  return p;
 }
 function drawFrame(time){
  if(!obj||!obj.root||!obj.root.isConnected){raf=0;return;}if(document.hidden){if(!obj.hiddenAt)obj.hiddenAt=time;raf=requestAnimationFrame(drawFrame);return;}if(obj.hiddenAt){if(obj.playing&&!obj.playing.pausedAt)obj.playing.start+=time-obj.hiddenAt;obj.hiddenAt=null;}
  const fps=!obj.playing||obj.playing.pausedAt?12:window.innerWidth<720?24:30;if(obj.lastFrame&&time-obj.lastFrame<1000/fps){raf=requestAnimationFrame(drawFrame);return;}const delta=Math.min(60,time-(obj.lastFrame||time-20));obj.frameDelta=delta;obj.lastFrame=time;
  const w=Math.max(240,Math.min(1550,Math.round(obj.root.clientWidth))),h=Math.max(185,Math.min(780,Math.round(obj.root.clientHeight)));
  if(obj.canvas.width!==w||obj.canvas.height!==h){obj.canvas.width=w;obj.canvas.height=h;}
  const aspect=w/h,verts=[],labels=[];let pos,staticPass=false;const push=(p,c)=>{if(staticPass){obj.arenaMesh.push(...p,...c);return;}const v=project(p,cam,aspect);verts.push(...v,...c)};
  // Directional skylight and bounce light give faces dimensional shading.
  const tri=(a,b,c,col)=>{
   const u=subtract(b,a),v=subtract(c,a),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
   const n=norm(cross),light=norm([-.48,.96,.54]),illum=.69+.30*Math.abs(n[0]*light[0]+n[1]*light[1]+n[2]*light[2]);
   const tint=color(col,illum);push(a,tint);push(b,tint);push(c,tint);
  };
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
  // Skeletal-looking jointed anatomy: mesh limbs, clothing, hair, hands and shoes.
  // These are generated 3D meshes rather than the old circle-and-cube player sprites.
  const joint=(a,b,r1,r2,col)=>{
   const axis=norm(subtract(b,a)),up=Math.abs(axis[1])>.86?[1,0,0]:[0,1,0],cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
   let u=norm(cross(axis,up)),v=norm(cross(axis,u));const seg=8;
   const ring=(center,r,j)=>add(center,add(scale(u,Math.cos(j*PI*2/seg)*r),scale(v,Math.sin(j*PI*2/seg)*r)));
   for(let i=0;i<seg;i++){const a0=ring(a,r1,i),a1=ring(a,r1,i+1),b0=ring(b,r2,i),b1=ring(b,r2,i+1);quad(a0,b0,b1,a1,color(col,.77+(i%3)*.095));}
  };
  const ellipsoid=(center,radii,col)=>{const rings=6,segs=9;
   const point=(th,ph)=>[center[0]+radii[0]*Math.sin(th)*Math.cos(ph),center[1]+radii[1]*Math.cos(th),center[2]+radii[2]*Math.sin(th)*Math.sin(ph)];
   for(let i=0;i<rings;i++)for(let j=0;j<segs;j++){const a=i*PI/rings,b=(i+1)*PI/rings,c=j*2*PI/segs,d=(j+1)*2*PI/segs;
    quad(point(a,c),point(b,c),point(b,d),point(a,d),color(col,.80+Math.sin(i*PI/rings)*.17+(j%3)*.04));}
  };
  const uniformFor=(school,side)=>{
   const name=String(school||'').toUpperCase();
   if(name.includes('KARASUNO'))return [.13,.15,.18];
   if(name.includes('NEKOMA'))return [.72,.17,.18];
   if(name.includes('AOBA'))return [.18,.45,.35];
   if(name.includes('INARIZAKI'))return [.68,.63,.51];
   if(name.includes('SHIRATORIZAWA'))return [.71,.62,.73];
   if(name.includes('FUKURODANI'))return [.16,.24,.38];
   if(name.includes('DATE'))return [.16,.49,.50];
   if(name.includes('KAMOMEDAI'))return [.40,.61,.70];
   return side?[.69,.24,.28]:[.19,.35,.56];
  };
  const roster=obj.match?.rosters||[[],[]];
  const play=obj.playing,elapsed=play?(play.pausedAt?play.pausedAt-play.start:time-play.start)*play.rate/play.duration:2;
  const at=clamp(elapsed,0,1),tracks=play?.tracks||[];
  const beatIndex=tracks.length?Math.min(tracks.length-1,Math.floor(at*tracks.length)):0;
  const seg=tracks[beatIndex]||null,beatProgress=tracks.length?clamp(at*tracks.length-beatIndex,0,1):0;
  // Accelerate after contact; the jump trajectory follows the intended rally touch.
  let ball=obj.restBall||[0,2.1,9.65];
  if(seg){
   ball=flightPoint(seg,beatProgress);
  }
  obj.ball=ball;
  const actorInfo=seg,activeRoster=roster[seg?.side||0]||[];
  const index=activeRoster.findIndex(x=>x.name===seg?.name);
  const actorSpot=seg?.actorPos||athleteXYZ(seg?.side||0,index>=0?index:2);
  const cam=camera(actorSpot,actorInfo,beatProgress);obj.lastCamera=cam;
  if(play&&beatIndex!==play.lastBeat){
   play.lastBeat=beatIndex;
   const names={serve:'SERVICE',receive:'RECEIVE',dig:'DIG • KEEP IT ALIVE',set:'THE SET',spike:'SPIKE • GO FOR THE POINT',block:'ROOF BLOCK',dump:'SETTER DUMP',tip:'SOFT TOUCH'};
   const headline=obj.root.querySelector('.v22-action-callout');
   const subtitle=obj.root.querySelector('.v22-action-detail');
   if(headline)headline.textContent=names[seg.kind]||String(seg.kind||'RALLY').toUpperCase();
   if(subtitle)subtitle.textContent=(seg.name||'PLAYER')+'  ·  '+(seg.side===0?'HOME':'AWAY');
  }
  const pb=obj.root.querySelector('.v22-replay-fill');if(pb)pb.style.width=(at*100).toFixed(1)+'%';
  // PRO-SIZE VOLLEYBALL ARENA. Actual 9 x 18 metre playable rectangle
  // surrounded by a wide safety zone, baselines, attack lines, antennae,
  // lit advertising boards, tiered stands, roof trusses and floodlights.
  if(!obj.arenaMesh){obj.arenaMesh=[];staticPass=true;
  box(0,-.53,0,30,.45,37,[.045,.075,.13]);
  box(0,-.25,0,21,.23,29,[.075,.16,.18]);
  // Real court timber: inset playing surface and out-of-bounds safety zone.
  box(0,-.115,0,10.25,.115,20.3,[.17,.37,.40]);
  for(let z=-9;z<9;z+=.56){const k=(Math.floor((z+9)/.56)%5);
   box(0,-.038,z+.279,9.04,.026,.556,[.73+k*.008,.49+k*.007,.27+k*.005]);
   // Fine grain grooves make the floor read as real wooden boards.
   if(k===0)line3([-4.46,-.012,z],[4.46,-.012,z],.016,[.45,.28,.16]);
  }
  // Official sidelines, end lines, attack lines and center stripe.
  for(const x of [-4.5,4.5])line3([x,.018,-9.02],[x,.018,9.02],.075,line);
  for(const z of [-9,9,-3,3])line3([-4.53,.021,z],[4.53,.021,z],.074,line);
  line3([-4.51,.026,0],[4.51,.026,0],.085,[1,.86,.58]);
  // Service zones and replacement/service extension markings.
  for(const sgn of [-1,1])for(const x of [-4.5,4.5])line3([x,.025,sgn*9.18],[x,.025,sgn*9.72],.044,line);
  // Tall taut net, visible mesh and contrasting bands/antennae.
  for(let x=-4.5;x<=4.6;x+=.23)line3([x,1.46,0],[x,2.46,0],.012,[.79,.87,.93]);
  for(let y=1.46;y<=2.46;y+=.21)line3([-4.55,y,0],[4.55,y,0],.012,[.69,.81,.91]);
  line3([-4.58,2.49,0],[4.58,2.49,0],.065,[1,1,1]);
  line3([-4.58,1.46,0],[4.58,1.46,0],.048,[.94,.94,.94]);
  for(const x of [-4.65,4.65]){
   line3([x,0,0],[x,3.35,0],.105,[.15,.48,.66]);
   line3([x,2.45,0],[x,3.55,0],.050,[1,.34,.25]);
   for(let y=2.6;y<3.5;y+=.25)box(x,y,0,.11,.12,.11,[1,1,1]);
  }
  // Arena stands: sculpted stairs, alternating seat colours, audience silhouettes.
  for(const sgn of [-1,1]){
   for(let tier=0;tier<5;tier++){
    const x=sgn*(6.65+tier*.85),y=.11+tier*.49;
    box(x,y-.22,0,.89,.44,28,[.078+tier*.009,.12+tier*.01,.19+tier*.009]);
    box(x,y+.025,0,.76,.08,27,[.13,.22,.29]);
    for(let j=-12;j<=12;j+=1.35){
     const row=(Math.round(j*10)+tier*3)%6;
     box(x,y+.22,j,.41,.34,.35,row<2?[.29,.46,.55]:row<4?[.39,.22,.26]:[.19,.28,.44]);
     if(j%3.4>1.4)ellipsoid([x,y+.48,j],[.19,.21,.18],row<3?[.66,.54,.45]:[.30,.35,.43]);
    }
   }
   // LED ribbon around the court, behind the playing lines.
   for(let j=-12;j<12;j+=1.9)box(sgn*5.8,.40,j,.20,.55,1.72,
      ((j+12)/1.9|0)%3===0?[.09,.66,.76]:((j+12)/1.9|0)%3===1?[.13,.38,.78]:[.84,.35,.12]);
  }
  // End stands, scorer's table, ceiling supports and indoor arena lighting.
  for(const sgn of [-1,1]){
   box(0,.36,sgn*12.05,12,.75,.45,[.14,.26,.32]);
   for(let j=-5;j<=5;j+=1.2)box(j,.81,sgn*12.5,.83,.7,.67,[.24,.36,.46]);
   if(sgn<0)box(0,6.9,sgn*11.95,19,.28,.22,[.19,.27,.36]);
   if(sgn<0)for(let x=-7.5;x<=7.5;x+=3)box(x,6.5,sgn*10.5,1.95,.08,.43,[.75,.87,1]);
  }
  for(let z=-11;z<=-5;z+=5.4){
   box(0,7.65,z,22,.13,.22,[.16,.28,.39]);
   for(const x of [-8,-3,3,8])box(x,7.34,z,.95,.12,.72,[.88,.95,1]);
  }
  // Coaching bench, scorer table and an elevated video scoreboard housing.
  box(-6.25,.38,10.2,2.9,.73,1.0,[.10,.18,.26]);
  box(0,5.8,-11.6,5.6,2,.35,[.055,.14,.24]);
  box(0,5.8,-11.32,5.0,1.42,.09,[.08,.38,.54]);
  staticPass=false;}
  for(let j=0;j<obj.arenaMesh.length;j+=6){const a=obj.arenaMesh;push([a[j],a[j+1],a[j+2]],[a[j+3],a[j+4],a[j+5]]);}
  // Flat target highlight, click-to-aim reflected in the 3D floor.
  if(obj.targetMarker){const zone=xyzZone(obj.targetMarker.side,obj.targetMarker.zone);box(zone[0],.035,zone[2],.12,.02,.5,[.35,.90,1]);box(zone[0],.035,zone[2],.5,.02,.12,[.35,.90,1]);
   line3([zone[0]-1.25,.10,zone[2]-1.15],[zone[0]+1.25,.10,zone[2]-1.15],.13,[.35,.90,1]);line3([zone[0]-1.25,.10,zone[2]+1.15],[zone[0]+1.25,.10,zone[2]+1.15],.13,[.35,.90,1]);}
  const density=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?0:1;
  for(let side=0;side<2;side++)for(let i=0;i<6;i++){
   const base=athleteXYZ(side,i),r=roster[side]?.[i]||{},tone=r.position==='L'?(side?[.91,.91,.85]:[.95,.39,.12]):uniformFor(r.school,side),sign=side===0?-1:1;
   const active=!!(play&&at<1&&seg?.side===side&&seg.name===r.name);
   const next=tracks[beatIndex+1],anticipate=!!(play&&at<1&&next?.side===side&&next.name===r.name);
   const action=active?seg.kind:anticipate?'run':'idle';
   const phase=active?beatProgress:anticipate?beatProgress:0,wind=Math.sin(phase*PI),breath=density?Math.sin(time*.0025+i)*.016:0;
   const jumping=active&&['spike','block','serve','dump'].includes(action),jump=jumping?Math.max(0,Math.sin(Math.PI*clamp(phase/.76,0,1)))*(action==='spike'?1.20:action==='serve'?.98:.7):0;
   const crouch=active&&['dig','receive'].includes(action)?.45*(.5+.5*Math.sin(PI*phase)):active&&action==='set'?.13:0;
   const runPos=active?seg.actorPos:anticipate?next.actorPos:base;
   // Athletes shuffle into receiving lanes, sprint toward the set and land again.
   const amount=active?clamp((phase+.16)*2.5,0,1):anticipate?clamp((phase-.22)*1.6,0,.68):0;
   obj.playerPositions=obj.playerPositions||{};
   const key=side+':'+i,desired=active?runPos:anticipate?next.actorPos:base;
   const old=obj.playerPositions[key]||desired;
   const follow=1-Math.exp(-delta/(active?55:220));
   const x=mix(old[0],desired[0],follow),z=mix(old[2],desired[2],follow);
   obj.playerPositions[key]=[x,0,z];
   const running=(active||anticipate)&&density?Math.sin(phase*PI)*.22:0;
   const y=jump-crouch+breath;
   const skin=r.name?.includes('Sakusa')?[.83,.67,.58]:[.94,.73,.60],hair=r.name?.includes('Hinata')?[.81,.28,.13]:r.name?.includes('Bokuto')?[.76,.77,.80]:r.name?.includes('Kenma')?[.72,.63,.37]:r.name?.includes('Kuroo')?[.10,.09,.12]:r.name?.includes('Oikawa')?[.32,.21,.16]:[.105,.105,.14];
   const black=[.075,.086,.14],sock=[.89,.89,.88],trim=r.school==='KARASUNO'?[.90,.43,.17]:[.91,.92,.96];
   const coordinate=(dx,dy,dz)=>[x+dx,y+dy,z+dz];
   // Soft painted footprint, not the old character circle.
   box(x,.035,z,.55,.012,.49,[.10,.13,.18]);
   const stride=running*Math.sin(phase*PI*5+i)+Math.sin(time*.002+i*2)*.022;
   const hipLeft=coordinate(-.16,.94,0),hipRight=coordinate(.16,.94,0);
   const kneeLeft=coordinate(-.20,.52+crouch*.5,sign*stride),kneeRight=coordinate(.20,.52+crouch*.5,-sign*stride);
   const footLeft=coordinate(-.20,.14+crouch,sign*(stride+.06)),footRight=coordinate(.20,.14+crouch,-sign*(stride+.06));
   joint(hipLeft,kneeLeft,.147,.102,skin);joint(kneeLeft,footLeft,.112,.076,skin);
   joint(hipRight,kneeRight,.147,.102,skin);joint(kneeRight,footRight,.112,.076,skin);
   ellipsoid(coordinate(-.20,.10+crouch,sign*(stride+.15)),[.14,.09,.26],r.name?.includes('Hinata')?[.63,.28,.16]:[.83,.86,.93]);
   ellipsoid(coordinate(.20,.10+crouch,sign*(-stride+.15)),[.14,.09,.26],[.83,.86,.93]);
   // Cloth jersey with shoulder taper; shorts and contrasting accent.
   joint(coordinate(0,.97,0),coordinate(0,1.63,0),.245,.37,tone);
   ellipsoid(coordinate(0,1.32,0),[.35,.41,.205],tone);
   box(x,y+1.10,z,.56,.13,.31,trim);
   ellipsoid(coordinate(0,.98,0),[.31,.21,.19],tone.map(c=>c*.77));
   const digit=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111'][i+1];
   if(digit)for(let n=0;n<15;n++)if(digit[n]==='1')box(x+(n%3-1)*.047,y+1.47-Math.floor(n/3)*.047,z+sign*.213,.038,.038,.016,trim);
   // Ball-dependent arm posing: overhand contact, high setting, low dig, spike swing.
   const isHigh=['serve','spike','set','block','dump'].includes(action);
   const armLift=isHigh?(action==='set'||action==='block'?.78:Math.sin(PI*clamp(phase/.76,0,1))):(action==='dig'?-.33:0);
   for(const handSide of [-1,1]){
    const shoulder=coordinate(handSide*.32,1.54,0);
    let elbow,hand;
    if(action==='dig'||action==='receive'){
      elbow=coordinate(handSide*.33,.94,sign*.23);hand=coordinate(handSide*.12,.76,sign*.40);
    }else if(action==='set'){
      elbow=coordinate(handSide*.44,1.81,sign*.12);hand=coordinate(handSide*.27,2.36,sign*.20);
    }else if(action==='block'){
      elbow=coordinate(handSide*.38,2.0,0);hand=coordinate(handSide*.31,2.52,sign*.06);
    }else if(action==='spike'&&handSide===1){
      elbow=coordinate(.59,1.69+armLift*.38,sign*.13);hand=coordinate(.43,1.39+armLift*1.12,sign*.30);
    }else if(action==='serve'&&handSide===1){
      elbow=coordinate(.64,1.65+armLift*.41,sign*.12);hand=coordinate(.42,1.43+armLift*1.04,sign*.38);
    }else{
      elbow=coordinate(handSide*.45,1.11+armLift*.68,0);hand=coordinate(handSide*.40,.89+armLift*1.19,sign*.12);
    }
    if(active&&phase<.62){
     const reach=Math.exp(-Math.pow((phase-.38)/.13,2));
     if(['set','block','dig','receive'].includes(action)||handSide===1){
      const contact=seg.from.map((v,j)=>v+(j===0&&['set','block'].includes(action)?handSide*.13:0));
      hand=hand.map((v,j)=>mix(v,contact[j],reach));
      elbow=elbow.map((v,j)=>mix(v,(shoulder[j]+hand[j])*.5,reach*.7));
     }
    }
    joint(shoulder,elbow,.127,.108,skin);ellipsoid(elbow,[.108,.12,.108],skin);joint(elbow,hand,.106,.065,skin);ellipsoid(hand,[.089,.11,.075],skin);
   }
   joint(coordinate(0,1.64,0),coordinate(0,1.78,0),.125,.11,skin);
   ellipsoid(coordinate(0,1.98,0),[.23,.29,.21],skin);
   // Hair cap with individual fringe and directional style, plus brow/eyes/nose.
   ellipsoid(coordinate(0,2.168,0),[.248,.16,.23],hair);
   for(let h=0;h<5;h++){
     const d=(h-2)*.095;
     joint(coordinate(d,2.205,sign*.12),coordinate(d+(h%2?.03:-.025),2.09+(h%2?.025:-.06),sign*.23),.083,.013,hair);
   }
   for(const e of [-1,1]){
     ellipsoid(coordinate(e*.095,1.985,sign*.206),[.040,.032,.021],[.08,.08,.13]);
     joint(coordinate(e*.06,2.065,sign*.200),coordinate(e*.13,2.065,sign*.198),.012,.011,hair);
   }
   ellipsoid(coordinate(0,1.93,sign*.220),[.041,.048,.037],skin);
   labels.push({p:coordinate(0,2.58,0),label:(r.name||'PLAYER').split(' ').at(-1),rating:r.power||'',side,active});
  }
  // Crisp spinning volleyball, shadow and shot-specific particle trails.
  const shadowPos=[ball[0],.017,ball[2]];ellipsoid(shadowPos,[.26,.014,.26],[.11,.13,.16]);
  if(play&&at<1&&density&&seg&&beatProgress>.40){
   for(let i=1;i<=7;i++){
    const dt=i*.019,v=clamp(beatProgress-dt,.38,1),p=flightPoint(seg,v);
    ellipsoid(p,[.14-i*.014,.14-i*.014,.14-i*.014],i%2?[.57,.75,.96]:[.87,.76,.51]);
   }
  }
  if(play&&seg&&density&&beatProgress>=.38&&beatProgress<.60){
   const pulse=(beatProgress-.38)/.22,radius=.24+pulse*.72;
   const c=seg.kind==='spike'?[1,.68,.28]:[.57,.92,1];
   for(let k=0;k<20;k++){
    const a=k*2*PI/20,b=(k+1)*2*PI/20;
    const point=(angle,r)=>[seg.from[0]+Math.cos(angle)*r,seg.from[1]+Math.sin(angle)*r,seg.from[2]];
    quad(point(a,radius),point(b,radius),point(b,radius+.035*(1-pulse)),point(a,radius+.035*(1-pulse)),color(c,1-pulse*.5));
   }
  }
  sphere(ball,.217,[.98,.95,.83]);
  for(let j=0;j<5;j++){const a=(time*.005+j*PI*2/5);ellipsoid([ball[0]+Math.cos(a)*.18,ball[1]+Math.sin(a)*.12,ball[2]+Math.sin(a)*.16],[.040,.035,.046],j%2?[.26,.48,.78]:[.87,.68,.31]);}

  if(obj.gl){const gl=obj.gl;gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(obj.prog);gl.bindBuffer(gl.ARRAY_BUFFER,obj.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.DYNAMIC_DRAW);
   gl.enableVertexAttribArray(obj.aClip);gl.vertexAttribPointer(obj.aClip,4,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(obj.aColor);gl.vertexAttribPointer(obj.aColor,3,gl.FLOAT,false,28,16);gl.drawArrays(gl.TRIANGLES,0,verts.length/7);
  }else if(obj.fallback){drawFallback(obj.fallback,w,h,labels,ball,obj.match);} // WebGL unavailable fallback.
  if(obj.labels){
   if(!obj.tagNodes){obj.labels.innerHTML='';obj.tagNodes=labels.map(()=>{const el=document.createElement('span');obj.labels.append(el);return el;});}
   labels.forEach((x,i)=>{const p=project(x.p,cam,aspect),el=obj.tagNodes[i];
    const visible=p[3]>.2&&(cameraMode!=='cinematic'||x.active||!play);
    el.style.display=visible?'':'none';if(!visible)return;
    el.className='v22-player-tag '+(x.side?'opponent':'ally')+(x.active?' is-actor':'');
    el.textContent=x.label+' '+x.rating;
    el.style.left=((p[0]/p[3]*.5+.5)*100)+'%';el.style.top=((-p[1]/p[3]*.5+.5)*100)+'%';
   });
  }
  if(obj.playing&&at>=1){
   obj.restBall=ball;obj.playing=null;
   const label=obj.root.querySelector('.v22-move-label');if(label)label.textContent=play.event.action||'POINT SCORED';
   const headline=obj.root.querySelector('.v22-action-callout'),detail=obj.root.querySelector('.v22-action-detail');
   if(headline)headline.textContent='POINT • '+(obj.match?.names?.[play.event.winner]||(play.event.winner?'AWAY':'HOME'));
   if(detail)detail.textContent=play.event.action||'RALLY COMPLETE';
  }
  raf=requestAnimationFrame(drawFrame);
 }
 function drawFallback(canvas,w,h,labels,ball,match){const ctx=canvas.getContext('2d');if(!ctx)return;canvas.width=w;canvas.height=h;ctx.fillStyle='#082036';ctx.fillRect(0,0,w,h);ctx.fillStyle='#a77548';ctx.beginPath();ctx.moveTo(w*.28,h*.23);ctx.lineTo(w*.72,h*.23);ctx.lineTo(w*.96,h*.94);ctx.lineTo(w*.04,h*.94);ctx.fill();ctx.strokeStyle='#dbeefa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.12,h*.69);ctx.lineTo(w*.88,h*.69);ctx.moveTo(w*.20,h*.44);ctx.lineTo(w*.80,h*.44);ctx.stroke();for(let [i,x] of labels.entries()){const p=project(x.p,camera(),w/h);const px=(p[0]/p[3]*.5+.5)*w,py=(-p[1]/p[3]*.5+.5)*h;ctx.fillStyle=x.side?'#ff6558':'#57c9ff';ctx.beginPath();ctx.arc(px,py,9,0,PI*2);ctx.fill();}const p=project(ball,camera(),w/h);ctx.fillStyle='#fff9d0';ctx.beginPath();ctx.arc((p[0]/p[3]*.5+.5)*w,(-p[1]/p[3]*.5+.5)*h,8,0,PI*2);ctx.fill();}
 function setupTracks(event,rosters){
  const beats=normalizeEvent(event).beats,tracks=[];
  const lookup=(b)=>{const team=rosters?.[b.side]||[];const i=team.findIndex(x=>x.name===b.name);
   const base=athleteXYZ(b.side,i<0?2:i),sign=b.side===0?1:-1;
   let target=base.slice();
   if(b.kind==='serve')target=[base[0],0,sign*9.65];
   if(b.kind==='spike'||b.kind==='block'||b.kind==='dump')target=[base[0],0,sign*(b.kind==='block'?.9:1.7)];
   if(b.kind==='set')target=[base[0],0,sign*2.55];
   if(b.kind==='dig'||b.kind==='receive')target=[base[0]+((Number(b.zone)||4)%3-1)*.5,0,sign*6.0];
   return target;
  };
  if(!beats.length){beats.push({kind:'serve',side:event?.serve||0,name:rosters?.[event?.serve||0]?.[5]?.name||'SERVER',zone:4});}
  const contact=(b)=>{const p=lookup(b),sign=b.side===0?1:-1;
   return [p[0],b.kind==='spike'?3.45:b.kind==='block'?2.98:b.kind==='serve'?2.6:b.kind==='set'?2.40:.96,p[2]+(b.kind==='spike'?-sign*.17:0)];
  };
  beats.forEach((b,i)=>{
   const actorPos=lookup(b),from=contact(b),next=beats[i+1];
   const to=next?contact(next):xyzZone(b.side,b.zone||4);
   const attack=['spike','serve','dump','tip','block'].includes(b.kind);
   // A dig or set stays airborne; an attack drives across the net.
   const peak=b.kind==='set'?1.68:b.kind==='serve'?1.35:b.kind==='dig'||b.kind==='receive'?1.0:b.kind==='block'?.56:attack?.65:1.0;
   tracks.push({from,to,peak,name:b.name,kind:b.kind,zone:b.zone,side:b.side,actorPos,special:b.special||null});
  });return tracks;
 }

 function mount(container,match){if(!container||typeof document==='undefined')return;
  if(!obj)try{obj=init();}catch(err){console.warn('WebGL init failed',err);obj={canvas:document.createElement('canvas'),gl:null};}
  if(obj.root!==container){obj.tagNodes=null;if(obj.playing)obj.playing.lastBeat=-1;}obj.root=container;obj.match=match;container.prepend(obj.canvas);
  document.querySelectorAll?.('[data-camera]').forEach(b=>{b.classList.toggle('active',b.dataset.camera===cameraMode);b.setAttribute('aria-pressed',String(b.dataset.camera===cameraMode));});
  let labels=container.querySelector('.v22-labels');if(!labels){labels=document.createElement('div');labels.className='v22-labels';container.append(labels);}obj.labels=labels;
  if(!obj.gl){obj.fallback=obj.canvas;obj.canvas.className='v22-webgl v22-fallback';}
  let film=container.querySelector('.v22-film-ui');
  if(!film){film=document.createElement('div');film.className='v22-film-ui';film.innerHTML='<div class="v22-film-top"><div class="v22-film-title">NATIONALS / CENTRE COURT <small>3D MATCH REPLAY</small></div><div class="v22-film-live">● MATCH REPLAY</div></div><div class="v22-action-card"><div class="v22-action-callout">READY TO SERVE</div><div class="v22-action-detail">ATHLETES IN POSITION</div></div><div class="v22-replay-track"><span class="v22-replay-fill"></span></div>';container.append(film);}
  const zone=match?.aim?.serveZone;
  const phase=match?.type==='bot'?match?.phaseList?.[match.phaseIndex]:match?.pendingPhase;
  obj.targetMarker=(phase==='serve'||phase==='attack')?{side:match?.type==='live'?(match?.playingSide??0):0,zone:match?.aim?.[phase==='serve'?'serveZone':'attackZone']||4}:null;
  const event=match?.events?.at(-1);
  if(event&&prevRally!==match.rally){prevRally=match.rally;const tracks=setupTracks(event,match.rosters);obj.playing={start:performance.now(),duration:Math.max(700,Number(match?.v25ReplayMs)||Math.max(2400,tracks.length*720)),rate:obj.playbackRate||1,pausedAt:null,lastBeat:-1,tracks,event};const s=container.querySelector('.v22-move-label');if(s)s.textContent='🏐 '+(event.action||'LIVE RALLY');}
  if(!raf)raf=requestAnimationFrame(drawFrame);
 }
 function unmount(){if(obj){obj.root=null;obj.labels=null;obj.tagNodes=null;obj.playerPositions=null;obj.restBall=null;obj.canvas?.remove();obj.playing=null;obj.camEye=null;obj.camTarget=null;}if(raf){cancelAnimationFrame(raf);raf=0;}prevRally=-1;}
 function setPlaybackRate(rate){if(![.5,1,1.5,2].includes(Number(rate)))return obj?.playbackRate||1;
  if(obj?.playing){const p=obj.playing,now=performance.now(),previous=p.rate||1;const elapsed=((p.pausedAt||now)-p.start)*previous;
   p.start=(p.pausedAt||now)-elapsed/Number(rate);p.rate=Number(rate);}
  if(obj)obj.playbackRate=Number(rate);return Number(rate);
 }
 function pause(){if(obj?.playing&&!obj.playing.pausedAt){obj.playing.pausedAt=performance.now();return true;}return false;}
 function resume(){if(obj?.playing?.pausedAt){const p=obj.playing; p.start+=performance.now()-p.pausedAt;p.pausedAt=null;return true;}return false;}
 function isPaused(){return !!obj?.playing?.pausedAt;}
 function setCamera(mode){if(['broadcast','side','top','cinematic'].includes(mode)){cameraMode=mode;if(obj){obj.camEye=null;obj.camTarget=null;}}return cameraMode;}
 function getCamera(){return cameraMode;}
 return {isPlaying:()=>!!obj?.playing,mount,unmount,setCamera,getCamera,setPlaybackRate,pause,resume,isPaused,flightPoint,zoneXY,zoneAtScreen,xyzZone,athleteXYZ,normalizeEvent,setupTracks};
});
