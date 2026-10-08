import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.createExpeditionRenderer = function(canvas, assetBase) {
  let renderer;
  try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'}); }
  catch { const info=document.getElementById('assetStatus');if(info)info.textContent='WebGL不可用 · 使用2D兼容渲染';return null; }
  renderer.setSize(480,620);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  Object.assign(renderer.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});canvas.parentElement.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#101d2b');scene.fog=new THREE.Fog('#101d2b',30,65);
  const camera=new THREE.PerspectiveCamera(44,480/620,.1,100);camera.position.set(0,23,23);camera.lookAt(0,0,-3);
  scene.add(new THREE.HemisphereLight('#b9e3f8','#374134',2.0));
  const sun=new THREE.DirectionalLight('#fff0c8',3);sun.position.set(-8,18,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:15,bottom:-20});scene.add(sun);
  const fill=new THREE.DirectionalLight('#4abde9',2);fill.position.set(10,4,-10);scene.add(fill);
  const metal=new THREE.MeshStandardMaterial({color:'#35424b',metalness:.7,roughness:.55});
  const accent=new THREE.MeshStandardMaterial({color:'#69cde9',emissive:'#1ca8cc',emissiveIntensity:2,roughness:.3});
  const amber=new THREE.MeshStandardMaterial({color:'#ffc25f',emissive:'#c07c18',emissiveIntensity:1.4});
  function box(w,h,d,x,y,z,mat=metal){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
  // Procedural steel surface: fixed noise, panel joints, bolts. The units are downloaded CC0 GLBs.
  const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=256;const c=texCanvas.getContext('2d');c.fillStyle='#566069';c.fillRect(0,0,256,256);
  let seed=17;for(let i=0;i<17000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256,y=(seed>>>8)%256;c.fillStyle=`rgba(${seed%2?255:0},${seed%2?255:0},${seed%2?255:0},.06)`;c.fillRect(x,y,1,1);}
  c.strokeStyle='#222e38';c.lineWidth=5;c.strokeRect(3,3,250,250);c.strokeStyle='#78828a';c.lineWidth=1;c.strokeRect(8,8,240,240);for(const x of [15,241])for(const y of [15,241]){c.fillStyle='#2c3a41';c.beginPath();c.arc(x,y,3,0,7);c.fill();}
  const texture=new THREE.CanvasTexture(texCanvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(5,18);texture.colorSpace=THREE.SRGBColorSpace;
  new THREE.TextureLoader().load(window.GAME_CONFIG.assetOverrides?.['reference/art/terran-deck.webp']||`${assetBase}reference/art/terran-deck.webp`,image=>{texture.image=image.image;texture.needsUpdate=true;});
  box(15,.5,52,0,-.35,-6,new THREE.MeshStandardMaterial({map:texture,metalness:.55,roughness:.75}));
  for(const x of [-7.9,7.9]){box(.6,1,52,x,.2,-6);box(.12,.08,50,x-.4*Math.sign(x),.77,-6,accent);for(let z=-30;z<18;z+=4){box(1.5,1.7,.5,x,.4,z);box(.6,.12,1.1,x,.9,z,amber);box(2,1.0,1.7,x+Math.sign(x)*2,-.8,z);}}
  const templates={},groups={friends:[],enemies:[],shots:[],gates:[]};const loader=new GLTFLoader();let loaded=0;
  const names=['astronautA','astronautB','alien','rover','turret_double','weapon_rifle','craft_speederA','platform_straight','rock_largeA'];
  const status=document.getElementById('assetStatus');
  const loadName=async name=>{try{const uri=window.GAME_CONFIG.assetOverrides?.[`space-kit/${name}.glb`]||`${assetBase}space-kit/${name}.glb`;const result=await loader.loadAsync(uri);templates[name]=result.scene;templates[name].traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});loaded++;if(status)status.textContent=`公开素材已载入 ${loaded}/${names.length} · Kenney CC0`;}catch(error){console.error('GLB asset failed:',name,error);if(status)status.textContent='部分模型读取失败 · 使用兼容模型';}};
  Promise.all(names.map(loadName)).then(()=>{groups.friends.forEach(g=>scene.remove(g));groups.enemies.forEach(g=>scene.remove(g));groups.friends=[];groups.enemies=[];});
  function model(name,height=1.4){let g;if(templates[name]){g=templates[name].clone(true);const b=new THREE.Box3().setFromObject(g),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());const k=height/Math.max(size.y,.01);g.scale.setScalar(k);g.position.set(-center.x*k,-b.min.y*k,-center.z*k);const wrap=new THREE.Group();wrap.add(g);g=wrap;}else{g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.6,3,6),new THREE.MeshStandardMaterial({color:name==='alien'?'#a3714c':'#5fa7c5',metalness:.35,roughness:.6}));body.position.y=.8;g.add(body);}return g;}
  function createUnit(type,boss=false){const g=new THREE.Group();g.userData.type=type;const m=model(type,boss?3.6:type==='rover'?1.2:1.5);m.rotation.y=type==='alien'?0:Math.PI;g.add(m);if(type==='astronautA'||type==='astronautB'){const weapon=model('weapon_rifle',.65);weapon.rotation.x=-Math.PI/2;weapon.position.set(.35,1.0,-.35);g.add(weapon);}scene.add(g);return g;}
  function ensure(pool,count,create){while(pool.length<count)pool.push(create(pool.length));for(let i=0;i<pool.length;i++)pool[i].visible=i<count;}
  function world(x,y){return{x:(x-240)/34,z:(y-390)/31};}
  const beamGeo=new THREE.CylinderGeometry(.025,.065,1,5);const boltMat=new THREE.MeshBasicMaterial({color:'#ffeab2'});
  function label(text,color){const cv=document.createElement('canvas');cv.width=256;cv.height=80;const ct=cv.getContext('2d');ct.fillStyle='#0c1e30dd';ct.fillRect(0,0,256,80);ct.strokeStyle=color;ct.lineWidth=5;ct.strokeRect(3,3,250,74);ct.textAlign='center';ct.font='bold 32px system-ui';ct.fillStyle=color;ct.fillText(text,128,51);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:false}));sprite.scale.set(5,1.55,1);return sprite;}
  let gateKey='';const deathFlashes=[];let oldKills=0;
  const scorch=new THREE.TextureLoader().load(window.GAME_CONFIG.assetOverrides?.['reference/fx/droppod-scorch.png']||`${assetBase}reference/fx/droppod-scorch.png`);
  const sparks=new THREE.BufferGeometry(),sparkPositions=new Float32Array(160*3);sparks.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3));
  const sparkCloud=new THREE.Points(sparks,new THREE.PointsMaterial({color:'#ffc677',size:.13,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(sparkCloud);
  function applyEdit(group,id,base=1){const edit=window.GAME_CONFIG.elementEdits?.[id];if(!edit)return;group.scale.setScalar(base*(edit.scale||1));if(edit.color)group.traverse(o=>{if(!o.material||o.userData.editTint)return;o.material=o.material.clone();o.material.color?.set(edit.color);o.userData.editTint=true;});}
  function render(data){
    const {player,enemies,bullets,gates,particles=[],time,state,kills,buildPhase=5,revealCount=Infinity}=data;
    particles.slice(0,160).forEach((p,i)=>{const w=world(p.x,p.y);sparkPositions[i*3]=w.x;sparkPositions[i*3+1]=.8+p.life;sparkPositions[i*3+2]=w.z;});sparks.setDrawRange(0,Math.min(160,particles.length));sparks.attributes.position.needsUpdate=true;sparks.computeBoundingSphere();
    const n=buildPhase<2?0:Math.min(revealCount,32,Math.max(1,Math.ceil(player.army/2)));ensure(groups.friends,n,i=>createUnit(i>11?'rover':i%5===4?'astronautB':'astronautA'));
    groups.friends.slice(0,n).forEach((g,i)=>{const p=world(player.x+(i%6-2.5)*21,player.y+Math.floor(i/6)*21);g.position.set(p.x,state==='playing'?Math.sin(time*9+i)*.03:0,p.z);g.rotation.y=Math.sin(time*1.5+i)*.03;applyEdit(g,'player');});
    const shown=(buildPhase<3?[]:state==='ready'?[...Array.from({length:22},(_,i)=>({x:65+(i%7)*53,y:65+Math.floor(i/7)*40,boss:false})),{x:240,y:35,boss:true}]:enemies).slice(0,revealCount);
    ensure(groups.enemies,shown.length,i=>createUnit('alien',Boolean(shown[i]?.boss)));
    shown.forEach((e,i)=>{const g=groups.enemies[i];const desired=e.boss?2.4:1;if(g.userData.boss!==e.boss){g.scale.setScalar(desired);g.userData.boss=e.boss;}const p=world(e.x,e.y);g.position.set(p.x,Math.sin(time*7+i)*.07,p.z);g.rotation.z=Math.sin(time*8+i)*.04;applyEdit(g,'enemy',e.boss?2.4:1);});
    groups.friends.forEach(g=>{if(g.children[1])g.children[1].visible=buildPhase>=4;});
    const displayBullets=buildPhase===4?[{x:180,y:350},{x:240,y:280},{x:300,y:200}]:bullets;
    ensure(groups.shots,Math.min(100,displayBullets.length),()=>{const g=new THREE.Mesh(beamGeo,boltMat);g.rotation.x=Math.PI/2;scene.add(g);return g;});
    displayBullets.slice(0,100).forEach((b,i)=>{const p=world(b.x,b.y);groups.shots[i].position.set(p.x,1,p.z);});
    const key=gates.filter(g=>!g.used).map(g=>g.left+'|'+g.right).join(';');
    if(key!==gateKey){for(const g of groups.gates){scene.remove(g);g.material.map.dispose();g.material.dispose();}groups.gates=[];for(const gate of gates.filter(g=>!g.used))for(const value of [gate.left,gate.right]){const sp=label(value,value.startsWith('-')?'#ff866d':'#a6efeb');scene.add(sp);groups.gates.push(sp);}gateKey=key;}
    gates.filter(g=>!g.used).forEach((g,i)=>{for(let lane=0;lane<2;lane++){const sp=groups.gates[i*2+lane];if(sp){const p=world(lane?350:130,g.y);sp.position.set(p.x,1.8,p.z);}}});
    if(kills>oldKills){const g=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:scorch,transparent:true,opacity:.8,depthWrite:false}));g.rotation.x=-Math.PI/2;g.position.set((Math.random()-.5)*9,.02,-6);scene.add(g);deathFlashes.push({g,life:.35});}oldKills=kills;
    for(const fx of deathFlashes){fx.life-=.016;fx.g.scale.multiplyScalar(1.07);fx.g.material.opacity=Math.max(0,fx.life*2);if(fx.life<=0){scene.remove(fx.g);fx.g.geometry.dispose();fx.g.material.dispose();}}while(deathFlashes[0]?.life<=0)deathFlashes.shift();
    const tint=window.GAME_CONFIG.elementEdits?.scene?.color;if(tint)scene.background.set(tint);renderer.render(scene,camera);
  }
  const dispose=()=>{renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});};window.addEventListener('pagehide',dispose,{once:true});
  const raycaster=new THREE.Raycaster();
  let pickedUnit;
  function selectionBounds(id){const pool=id==='player'?groups.friends:id==='enemy'?groups.enemies:groups.shots;const unit=pool.includes(pickedUnit)&&pickedUnit.visible?pickedUnit:pool.find(g=>g.visible);if(!unit)return null;const box=new THREE.Box3().setFromObject(unit);const points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);points.push({x:(p.x+1)*240,y:(1-p.y)*310});}const x=Math.min(...points.map(p=>p.x))-5,y=Math.min(...points.map(p=>p.y))-5;return{x,y,w:Math.max(35,Math.max(...points.map(p=>p.x))-x+5),h:Math.max(45,Math.max(...points.map(p=>p.y))-y+5)};}
  function pick(event){const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);const hits=raycaster.intersectObjects([...groups.friends,...groups.enemies,...groups.shots].filter(g=>g.visible),true);let o=hits[0]?.object;while(o){if(groups.friends.includes(o)){pickedUnit=o;return 'player';}if(groups.enemies.includes(o)){pickedUnit=o;return 'enemy';}if(groups.shots.includes(o)){pickedUnit=o;return 'weapon';}o=o.parent;}return 'scene';}
  return {render,dispose,pick,selectionBounds};
};
