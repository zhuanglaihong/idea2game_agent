/* AI 编写的原创可玩样例。模板参数调整不等同于远端模型生成。 */
(() => {
  'use strict';
  const cfg = window.GAME_CONFIG;
  const building=cfg.previewStage!=null&&cfg.previewStage<5;
  const buildPhase=cfg.previewStage??5;
  const buildStarted=performance.now();
  const revealCount=()=>building?Math.floor((performance.now()-buildStarted)/130)+1:Infinity;
  if(building&&document.querySelectorAll){
    document.querySelectorAll('.buttons,.skills,.traits,.hint,header,.level').forEach(el=>el.style.visibility=buildPhase>=4?'visible':'hidden');
    const banner=document.createElement('div');banner.textContent=['分析玩法，准备工程','搭建场景与地形','放置角色与卡牌','加入敌人与游戏图案','连接武器、规则与界面'][buildPhase];
    Object.assign(banner.style,{position:'absolute',top:'12px',left:'12px',right:'12px',zIndex:10,padding:'10px',background:'#172c36dd',color:'#fff',borderRadius:'8px',font:'13px system-ui',pointerEvents:'none'});canvasBanner();
    function canvasBanner(){document.getElementById('battlefield').append(banner);}
  }
  const edits=cfg.elementEdits||{};
  let editing=false,coverWasHidden=false;
  let selectionMark;
  let selectedId,selectedCard,selectedEnemy;
  const selectionNames={player:'玩家角色',weapon:'环绕飞刀',enemy:'敌人',scene:'场景',cards:'卡牌图案'};
  function selectElement(id){selectedId=id;parent.postMessage({type:'idea2game:element-selected',element:{id,name:selectionNames[id]},kind:cfg.kind},'*');}
  function drawSelection(){
    if(!editing||!selectedId){if(selectionMark)selectionMark.style.display='none';return;}
    if(!document.createElement)return;
    if(!selectionMark){selectionMark=document.createElement('div');selectionMark.setAttribute('aria-label','游戏元素选中标记');Object.assign(selectionMark.style,{position:'absolute',border:'3px solid #ffd166',boxShadow:'0 0 0 3px #17283999,0 0 22px #ffd166aa',borderRadius:'12px',pointerEvents:'none',zIndex:20,boxSizing:'border-box'});canvas.parentElement.append(selectionMark);}
    let b={x:6,y:6,w:W-12,h:H-12};
    if(cfg.kind==='zombies'&&expedition?.selectionBounds&&selectedId!=='scene'){b=expedition.selectionBounds(selectedId)||b;}
    else if(selectedId==='cards'){const c=selectedCard&&!selectedCard.removed?selectedCard:cards.find(c=>!c.removed&&available(c));if(c){const r=rect(c);b={x:r.x-3,y:r.y-3,w:r.w+6,h:r.h+12};}}
    else if(selectedId!=='scene'){
      let p=player;
      if(selectedId==='enemy')p=selectedEnemy||enemies[0]||(cfg.kind==='history'?{x:player.x-170,y:player.y-130}:{x:135,y:169});
      if(selectedId==='weapon')p=knifePositions()[0]||player;
      const q=cfg.kind==='history'?project(p.x,p.y,selectedId==='weapon'?25:22):p;
      b={x:q.x-29,y:q.y-43,w:58,h:70};if(selectedId==='weapon')b={x:q.x-24,y:q.y-25,w:48,h:50};
    }
    Object.assign(selectionMark.style,{display:'block',left:b.x/W*100+'%',top:b.y/H*100+'%',width:b.w/W*100+'%',height:b.h/H*100+'%'});
    selectionMark.textContent='';Object.assign(selectionMark.style,{color:'#172839',font:'bold 11px system-ui',textAlign:'center',textShadow:'0 0 4px #fff',paddingTop:'2px',background:'#ffd16615'});
  }
  window.addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='idea2game:edit-mode')return;const enabled=Boolean(e.data.enabled);selectedId=e.data.selectedId;if(enabled&&!editing){coverWasHidden=$('cover').hidden;$('cover').hidden=true;}if(!enabled&&editing){$('cover').hidden=coverWasHidden;if(selectionMark)selectionMark.style.display='none';}editing=enabled;pointer.down=false;keys.clear();if(editing&&state==='playing')pause();canvas.style.cursor=editing?'crosshair':'';});
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 480, H = 620;
  const emojis = ['🌿', '🍄', '🌻', '🍓', '🦋', '🌙'];
  const farmAtlas=typeof Image==='undefined'?null:new Image();
  if(farmAtlas)farmAtlas.src=cfg.assetOverrides?.['farm-atlas.png']||(cfg.assetBase||'')+'farm-atlas.png';
  const $ = id => document.getElementById(id);
  let bossDefeated = false;
  let state = 'ready', frame = 0, last = 0, time = 0, score = 0, player, enemies, bullets, gates, particles, spawn, gateClock, kills, bossSpawned, cards, tray, moves, history, upgrading, nextUpgrade;
  let pointer = { x: W / 2, y: H - 120, down: false }, keys = new Set();
  const speed = cfg.speed;
  let diff = cfg.difficulty, nextLevel = false, orbitAngle = 0, drops = [], upgrades = {};
  let skillCooldown={airstrike:0,reinforce:0,rally:0},boost=0,knifeClock=0,damageLabels=[];
  let expedition=null;
  if(cfg.kind==='zombies'&&window.createExpeditionRenderer)expedition=window.createExpeditionRenderer(canvas,cfg.assetBase);
  let best = 0;
  try { best = Number(localStorage.getItem('forge-best-' + cfg.kind)) || 0; } catch {}
  function init() {
    skillCooldown={airstrike:0,reinforce:0,rally:0};boost=0;knifeClock=0;damageLabels=[];
    nextLevel = false; orbitAngle = 0; drops = []; upgrades = {};
    bossDefeated = false; time = score = kills = spawn = gateClock = 0; enemies = []; bullets = []; gates = []; particles = []; bossSpawned = false; upgrading = false; nextUpgrade = 10; keys.clear();
    player = { x: W / 2, y: H - 110, hp: 100, army: 12, rate: .22, shot: 0, damage: cfg.hero === '谋士' ? 20 : 12, radius: 15 };
    if (cfg.hero === '铁卫' || cfg.kind === 'zombies') player.hp = 150;
    if(cfg.kind==='zombies'){player.army=12;player.damage=16;player.rate=.2;const squad=$('squad')?.value;if(squad==='heavy')player.hp=200;if(squad==='rapid')player.rate=.15;}
    if (cfg.hero === '弓将') player.rate = .15;
    Object.assign(player, { level: 1, xp: 0, xpNeed: 12, knives: edits.weapon?.count||1, quality: 1, orbitRadius: 78 });
    if(edits.player?.hp)player.hp=edits.player.hp;
    pointer = { x: player.x, y: player.y, down: false };
    cards = []; tray = []; moves = 0; history = [];
    for (let layer = 0; layer < diff + 1; layer++) {
      const types = Array.from({length: 18}, (_, i) => Math.floor(i / 3));
      for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
      types.forEach((type, slot) => cards.push({type, slot, layer, removed: false}));
    }
    $('choices').hidden = true; $('pause').textContent = '暂停'; $('cover').hidden = false;
    $('coverTitle').textContent = cfg.name; $('coverText').textContent = `第 ${diff} 关 · 难度 ${diff}：` + (cfg.kind === 'tiles' ? '点击没有被压住的图案，三个相同即可消除。七格槽，通关可进入下一关。' : cfg.kind === 'zombies' ? '左右移动选择增援，装甲小队自动开火。击败尸潮选择强化，60秒后迎战首领。支持空袭、增援与鼓舞。' : cfg.kind === 'gates' ? '左右移动选择数字门，自动开火。' : '飞刀环绕角色，接触敌人造成伤害。拾取掉落经验，满级选择飞刀数量或品质强化。');
    const labels = cfg.kind==='gates'?['增援 +15','兵力 +30%','整编 +10']:cfg.kind === 'history' ? ['飞刀数量 +1', '飞刀品质 +1', '回复 40 生命'] : ['攻击 +10', '射速 +25%', '回复 40 生命'];
    Array.from($('choices').querySelectorAll('button')).forEach((b,i)=>b.textContent=labels[i]);
    if (cfg.previewStage != null && cfg.previewStage < 5) { $('cover').hidden = true; for(const id of ['start','pause','reset','undo']) $(id).disabled = true; }
    $('start').textContent = '开始游戏'; state = 'ready'; updateHud();
  }
  function updateHud() {
    $('stats').textContent = cfg.kind === 'tiles' ? `步数 ${moves} · 剩余 ${cards.filter(c => !c.removed).length} · 槽 ${tray.length}/7` : cfg.kind === 'gates' ? `兵力 ${player.army} · 击败 ${kills} · ${Math.floor(time)}/60秒` : `生命 ${Math.ceil(player.hp)} · 击败 ${kills} · ${Math.floor(time)}/60秒`;
    $('best').textContent = '最高分 ' + best;
    if (cfg.kind === 'zombies') $('stats').textContent = `兵力 ${player.army} · 防线 ${Math.ceil(player.hp)} · 歼敌 ${kills} · ${Math.floor(time)}/60秒`;
    for(const id of ['airstrike','reinforce','rally'])if($(id)){const label={airstrike:'[1] 空袭',reinforce:'[2] 增援',rally:'[3] 鼓舞'}[id];$(id).textContent=label+(skillCooldown[id]>0?' '+Math.ceil(skillCooldown[id])+'s':'');$(id).disabled=state!=='playing'||skillCooldown[id]>0;}
    if (cfg.kind === 'history') $('stats').textContent = `生命 ${Math.ceil(player.hp)} · Lv.${player.level} · 经验 ${player.xp}/${player.xpNeed}`;
    if ($('level')) $('level').textContent = `第 ${diff} 关 · 难度 ${diff}`;
    if ($('traits')) $('traits').textContent = cfg.kind === 'history' ? `飞刀 ${player.knives} 把 · 品质 ${player.quality} · 击败 ${kills} · ${Math.floor(time)}/60秒` : (cfg.kind === 'zombies'||cfg.kind === 'gates') ? '已获得词条：' + (Object.entries(upgrades).map(([name,n])=>`${name} ×${n}`).join(' · ') || '暂无 · 击败10个敌人选择强化') : '通关后进入下一关 · 也可在创作台选择难度';
  }
  function finish(win) {
    state = 'ended'; score = cfg.kind === 'tiles' ? (win ? 1000 - moves : moves) : kills * 10 + Math.floor(time);
    if (score > best) { best = score; try { localStorage.setItem('forge-best-' + cfg.kind, String(best)); } catch {} }
    nextLevel = win && diff < 3;
    $('cover').hidden = false; $('coverTitle').textContent = win ? (cfg.kind==='zombies'?'长桥已守住 · 作战胜利':'挑战成功！') : (cfg.kind==='zombies'?'小队撤离 · 作战结束':'再挑战一次？'); $('coverText').textContent = `第 ${diff} 关${win?'完成':'挑战结束'} · 本局得分 ${score} · 最高分 ${best}`; $('start').textContent = nextLevel ? `进入第 ${diff+1} 关 · 难度 ${diff+1}` : '重新开始'; updateHud();
  }
  function start() { if (cfg.previewStage != null && cfg.previewStage < 5) return; if (state === 'ended') { if(nextLevel)diff++; init(); } if(cfg.kind==='zombies'&&state==='ready'){const squad=$('squad')?.value;player.hp=squad==='heavy'?200:150;player.rate=squad==='rapid'?.15:.2;}state = 'playing'; $('cover').hidden = true; last = performance.now(); canvas.focus(); }
  function pause() { if (upgrading) return; if (state === 'playing') { state = 'paused'; $('pause').textContent = '继续'; } else if (state === 'paused') { state = 'playing'; $('pause').textContent = '暂停'; last = performance.now(); canvas.focus(); } }
  function spark(x, y, color) { for (let i = 0; i < 7 && particles.length < 160; i++) particles.push({x, y, vx: (Math.random()-.5)*180, vy: (Math.random()-.5)*180, life: .5, color}); }
  function rect(c) { const dx = c.layer * 3; return {x: 24 + (c.slot % 6) * 70 + dx, y: 112 + Math.floor(c.slot / 6) * 86 - dx, w: 61, h: 70}; }
  function available(c) { return !c.removed && !cards.some(t => !t.removed && t.slot === c.slot && t.layer > c.layer); }
  function chooseCard(x, y) {
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i], r = rect(c);
      if (!c.removed && x >= r.x && x <= r.x+r.w && y >= r.y && y <= r.y+r.h) {
        if (!available(c)) return;
        history.push({ removed: cards.map(c => c.removed), tray: [...tray], moves });
        c.removed = true; tray.push(c.type); moves++;
        const matches = tray.filter(t => t === c.type).length;
        if (matches >= 3) { let n = 3; tray = tray.filter(t => { if (t === c.type && n > 0) { n--; return false; } return true; }); spark(r.x+30, r.y+35, cfg.color); }
        if (cards.every(c => c.removed)) finish(true); else if (tray.length >= 7) finish(false);
        updateHud(); return;
      }
    }
  }
  function enemy() {
    if (enemies.length >= (cfg.kind==='zombies'?75:50)) return;
    const angle=Math.random()*Math.PI*2, distance=420+Math.random()*120;
    enemies.push({x: cfg.kind==='history'?player.x+Math.cos(angle)*distance:30+Math.random()*(W-60), y: cfg.kind==='history'?player.y+Math.sin(angle)*distance:-25, hp: cfg.kind==='zombies'?60+diff*8:cfg.kind === 'gates' ? 24 + diff*8 : 24, max: cfg.kind==='zombies'?60+diff*8:24, r: 14, speed: 30 + diff*8, boss: false});
  }
  function knifePositions() {
    return Array.from({length:player.knives},(_,i)=>{const a=orbitAngle+i*Math.PI*2/player.knives;return{x:player.x+Math.cos(a)*player.orbitRadius,y:player.y+Math.sin(a)*player.orbitRadius,angle:a};});
  }
  function defeat(e) {
    kills++; if(cfg.kind==='history' && drops.length<100)drops.push({x:e.x,y:e.y,value:e.boss?30:6});
    if(e.boss){bossDefeated=true;finish(true);}
  }
  function offerUpgrade() { upgrading=true;state='paused';$('choices').hidden=false; }
  function step(dt) {
    time += dt;for(const id of Object.keys(skillCooldown))skillCooldown[id]=Math.max(0,skillCooldown[id]-dt);boost=Math.max(0,boost-dt);damageLabels.forEach(d=>{d.life-=dt;d.y-=30*dt});damageLabels=damageLabels.filter(d=>d.life>0);
    if (cfg.kind !== 'tiles') {
      const move = 235 * dt;
      if (keys.has('ArrowLeft') || keys.has('a')) player.x -= move;
      if (keys.has('ArrowRight') || keys.has('d')) player.x += move;
      if (cfg.kind === 'history') { if (keys.has('ArrowUp') || keys.has('w')) player.y -= move; if (keys.has('ArrowDown') || keys.has('s')) player.y += move; }
      if (pointer.down) { player.x += (pointer.x - player.x) * Math.min(1, dt*14); if (cfg.kind === 'history') player.y += (pointer.y - player.y) * Math.min(1,dt*14); }
      if(cfg.kind!=='history'){player.x = Math.max(24, Math.min(W-24,player.x)); player.y = Math.max(55,Math.min(H-65,player.y));}
      spawn -= dt; if (spawn <= 0 && time < 60) { enemy(); spawn = cfg.kind==='zombies'?Math.max(.15,.7/diff-time*.007):cfg.kind==='history'?Math.max(.14,.6/diff-time*.004):Math.max(.22,1.3/diff-time*.006); }
      if (time >= 60 && !bossSpawned) { bossSpawned = true; enemies.push({x: cfg.kind==='history'?player.x+180:W/2, y: cfg.kind==='history'?player.y-180:65, attackClock:3, warning:0, hp: 500 + diff*100, max: 500+diff*100, r: 40, speed: 12, boss: true}); }
      if ((cfg.kind === 'gates'||cfg.kind==='zombies') && time < 58) {
        gateClock -= dt;
        if (gateClock <= 0) { gates.push({y: -55, left: Math.random()>.45 ? '+10' : '×2', right: Math.random()>.5 ? '+15' : '-5', used:false}); gateClock = 6; }
        for (const g of gates) {
          g.y += 75 * speed * dt;
          if (!g.used && g.y >= player.y) { g.used = true; const val = player.x < W/2 ? g.left : g.right; player.army = Math.min(500, Math.max(0,val==='×2' ? player.army*2 : player.army+Number(val))); spark(player.x,player.y,cfg.color); }
        }
        gates = gates.filter(g => g.y < H+50);
      }
      player.shot -= dt;
      if (cfg.kind !== 'history' && player.shot <= 0 && bullets.length < 180) {
        let target = (cfg.kind === 'history' || cfg.kind === 'zombies') ? enemies.reduce((a,b) => !a || Math.hypot(b.x-player.x,b.y-player.y)<Math.hypot(a.x-player.x,a.y-player.y) ? b : a, null) : null;
        const angle = target ? Math.atan2(target.y-player.y,target.x-player.x) : -Math.PI/2;
        const shots=cfg.kind==='zombies'?Math.min(6,Math.ceil(player.army/4)):1;for(let i=0;i<shots;i++)bullets.push({x:player.x+(i-(shots-1)/2)*18,y:player.y-14,vx:Math.cos(angle)*420,vy:Math.sin(angle)*420,damage:cfg.kind==='gates'?5+player.army*.35:player.damage*(boost>0?1.6:1)});
        player.shot = cfg.kind === 'gates' ? Math.max(.07,.25-player.army*.0004) : player.rate;
      }
      for (const e of enemies) {
        if (cfg.kind === 'history' && e.boss) { e.attackClock=(e.attackClock??3)-dt; if(e.attackClock<=0){e.warning=1;e.attackClock=4;e.attackX=player.x;e.attackY=player.y;} if(e.warning>0){e.warning-=dt;if(e.warning<=0&&Math.hypot(player.x-e.attackX,player.y-e.attackY)<90){player.hp-=22;spark(player.x,player.y,'#ffd076');}} }
        if (cfg.kind === 'history') { const a = Math.atan2(player.y-e.y,player.x-e.x); e.x += Math.cos(a)*e.speed*speed*dt; e.y += Math.sin(a)*e.speed*speed*dt; }
        else e.y += e.speed*speed*dt;
        if (cfg.kind==='history') {
          e.hitCooldown=Math.max(0,(e.hitCooldown||0)-dt);
          if(Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.radius && e.hitCooldown<=0){player.hp-=e.boss?15:5;e.hitCooldown=.6;spark(player.x,player.y,'#ff6b78');}
        } else if (Math.hypot(player.x-e.x,player.y-e.y) < e.r+player.radius || e.y > (cfg.kind === 'zombies' ? H-95 : H+15)) { if(cfg.kind==='gates') player.army -= e.boss ? 30 : 4; else {player.hp -= e.boss ? 30 : 8;if(cfg.kind==='zombies')player.army=Math.max(1,player.army-1);} e.hp=0; if(e.boss)finish(false); spark(e.x,e.y,'#ff6b78'); }
      }
      if(cfg.kind==='history') {
        knifeClock+=dt;if(knifeClock>=5){knifeClock-=5;player.knives=Math.min(9,player.knives+1);}
        orbitAngle=(orbitAngle+dt*4.5*(edits.weapon?.speed||1))%(Math.PI*2);
        for(const e of enemies){e.knifeCooldown=Math.max(0,(e.knifeCooldown||0)-dt);if(e.hp>0&&e.knifeCooldown<=0&&knifePositions().some(k=>Math.hypot(k.x-e.x,k.y-e.y)<e.r+12)){const hit=player.damage+player.quality*6;e.hp-=hit;damageLabels.push({x:e.x,y:e.y,value:hit,life:.65});e.knifeCooldown=.16;spark(e.x,e.y,'#c3edf3');if(e.hp<=0)defeat(e);}}
        for(const d of drops){const dist=Math.hypot(d.x-player.x,d.y-player.y);if(dist<100){const a=Math.atan2(player.y-d.y,player.x-d.x);d.x+=Math.cos(a)*220*dt;d.y+=Math.sin(a)*220*dt;}if(dist<24){player.xp+=d.value;d.collected=true;}}
        drops=drops.filter(d=>!d.collected);
        if(player.xp>=player.xpNeed&&state==='playing'){player.xp-=player.xpNeed;player.level++;player.xpNeed+=8;offerUpgrade();}
      }
      for (const b of bullets) {
        b.x += b.vx*dt; b.y += b.vy*dt;
        for (const e of enemies) { if(e.hp>0 && Math.hypot(e.x-b.x,e.y-b.y)<e.r+4) { e.hp-=b.damage; b.y=-100; spark(e.x,e.y,cfg.color); if(e.hp<=0)defeat(e); break; } }
      }
      enemies = enemies.filter(e => e.hp>0&&(cfg.kind!=='history'||e.boss||Math.hypot(e.x-player.x,e.y-player.y)<1100)); bullets = bullets.filter(b=>b.y>-30&&b.y<H+30&&b.x>-20&&b.x<W+20);
      if (player.hp <= 0 || player.army <= 0) finish(false);
      if (bossDefeated && !enemies.some(e=>e.boss) && state==='playing') finish(true);
      if ((cfg.kind==='zombies'||cfg.kind==='gates') && kills>=nextUpgrade && state==='playing') { offerUpgrade(); nextUpgrade+=10; }
    }
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}); particles=particles.filter(p=>p.life>0); updateHud();
  }
  function round(x,y,w,h,r,fill,stroke) { ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();} }
  function oval(x,y,rx,ry,fill,stroke) {ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function line(x1,y1,x2,y2,color,width=2) {ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
  function farmIcon(type,x,y,size=1){size*=edits.cards?.scale||1;
    if(farmAtlas?.complete&&farmAtlas.naturalWidth){const width=farmAtlas.naturalWidth/3,height=farmAtlas.naturalHeight/2;ctx.drawImage(farmAtlas,(type%3)*width,Math.floor(type/3)*height,width,height,x-25*size,y-25*size,50*size,50*size);return;}
    ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.lineJoin='round';
    if(type===0){ // 绵羊
      oval(-14,-2,10,8,'#383f38');oval(14,-2,10,8,'#383f38');for(const [a,b] of [[-11,-10],[0,-15],[12,-10],[-16,0],[16,0],[0,7]])oval(a,b,10,10,'#fffcec','#77806b');oval(0,2,13,15,'#4c554c');oval(-5,-1,2,2,'#fff');oval(5,-1,2,2,'#fff');line(-4,10,4,10,'#f3c8a5');
    } else if(type===1){ // 胡萝卜
      ctx.beginPath();ctx.moveTo(-14,-7);ctx.quadraticCurveTo(0,-20,13,-6);ctx.lineTo(0,23);ctx.closePath();ctx.fillStyle='#ef8841';ctx.fill();ctx.strokeStyle='#9b552c';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<3;i++)line(-7+i*3,-3+i*7,3+i*2,-1+i*7,'#c76432');line(0,-10,-10,-22,'#4d943c',5);line(0,-10,9,-24,'#65a83f',5);line(0,-10,1,-26,'#73ad41',5);
    } else if(type===2){ // 玉米
      oval(0,-1,13,22,'#efc34d','#b79131');for(let a=-6;a<=6;a+=6)for(let b=-15;b<=15;b+=7)oval(a,b,2,2,'#fff08d');ctx.beginPath();ctx.moveTo(0,24);ctx.quadraticCurveTo(-27,15,-20,-10);ctx.quadraticCurveTo(-6,6,0,24);ctx.fillStyle='#579947';ctx.fill();ctx.beginPath();ctx.moveTo(0,24);ctx.quadraticCurveTo(25,12,20,-8);ctx.quadraticCurveTo(6,5,0,24);ctx.fillStyle='#7cb04c';ctx.fill();
    } else if(type===3){ // 干草
      round(-23,-16,46,34,7,'#d9b36a','#977945');for(let i=-16;i<20;i+=7)line(i,-12,i+3,15,'#ae854c',2);line(-23,-2,23,-2,'#715c39',4);line(0,-17,0,18,'#715c39',4);
    } else if(type===4){ // 水桶
      ctx.beginPath();ctx.moveTo(-18,-12);ctx.lineTo(18,-12);ctx.lineTo(13,20);ctx.lineTo(-13,20);ctx.closePath();ctx.fillStyle='#70adbd';ctx.fill();ctx.strokeStyle='#476f75';ctx.lineWidth=3;ctx.stroke();oval(0,-12,18,6,'#b4dfe0','#476f75');ctx.beginPath();ctx.arc(0,-10,16,Math.PI,0);ctx.strokeStyle='#657c74';ctx.lineWidth=3;ctx.stroke();line(-8,-5,-6,12,'#c5eef0',3);
    } else { // 花
      line(0,5,0,25,'#639945',4);oval(-10,17,10,4,'#7ba651');for(let i=0;i<7;i++){const a=i*Math.PI*2/7;oval(Math.cos(a)*12,Math.sin(a)*12-4,8,8,'#f4ca55','#bb9036');}oval(0,-4,8,8,'#9b693c');
    }ctx.restore();
  }
  function zombie(x,y,boss=false){ctx.save();ctx.translate(x,y);ctx.scale(boss?1.9:1, boss?1.9:1);const sway=Math.sin(time*5+x)*3;oval(0,21,17,5,'#24333055');line(-7,13,-9+sway,23,'#2c3540',7);line(7,13,9-sway,23,'#2c3540',7);round(-13,-2,26,22,6,boss?'#733f4a':'#56685d','#303a35');line(-14,4,-24+sway,10,'#77995d',7);line(14,4,24+sway,10,'#77995d',7);round(-13,-24,26,26,9,boss?'#849156':'#99b46b','#3c5141');round(-10,-24,19,6,3,'#364735');oval(-5,-13,3,3,'#fae3a5');oval(5,-13,3,3,'#fae3a5');line(-6,-3,6,-3,'#34402b',3);line(1,-5,1,0,'#faf3d0',2);ctx.restore();}
  function warrior(x,y,enemy=false){ctx.save();ctx.translate(x,y);const c=enemy?(edits.enemy?.color||'#a9534a'):(edits.player?.color||cfg.color);ctx.scale((enemy?edits.enemy:edits.player)?.scale||1,(enemy?edits.enemy:edits.player)?.scale||1);const stride=Math.sin(time*8+x)*2;oval(0,22,18,5,'#4c392f44');ctx.beginPath();ctx.moveTo(-11,-1);ctx.lineTo(-21,21);ctx.lineTo(17,21);ctx.lineTo(9,-3);ctx.closePath();ctx.fillStyle=enemy?'#713c37':'#456957';ctx.fill();line(-6,10,-8+stride,22,'#443934',6);line(6,10,8-stride,22,'#443934',6);round(-13,-4,26,23,5,c,'#4a4439');for(let i=1;i<15;i+=6)line(-11,i,11,i,'#43382d55');oval(0,-17,12,13,'#deb891','#5c4936');round(-13,-26,26,10,4,enemy?'#6a4642':'#46685c','#473e32');line(0,-28,0,-35,enemy?'#c46852':'#d4bb69',5);line(-13,1,-22,10,c,7);line(13,1,22,8,c,7);line(23,-16,23,22,'#b4965a',3);line(23,-16,29,-23,'#e9e1cd',5);oval(-4,-17,1.5,1.5,'#332b24');oval(4,-17,1.5,1.5,'#332b24');ctx.restore();}
  function monk(x,y){ctx.save();ctx.translate(x,y);ctx.scale(edits.player?.scale||1,edits.player?.scale||1);oval(0,22,20,6,'#233c3655');ctx.beginPath();ctx.moveTo(-10,-4);ctx.lineTo(-23,21);ctx.quadraticCurveTo(0,29,20,21);ctx.lineTo(10,-4);ctx.closePath();ctx.fillStyle=edits.player?.color||'#a9402d';ctx.fill();line(-8,-1,8,20,'#efd18b',5);oval(0,-17,12,14,'#e3b780','#634b35');oval(0,-29,12,6,'#dfad6f');for(let i=-10;i<=10;i+=5)oval(i,1+Math.abs(i)*.5,2,2,'#e9ca83');line(-12,0,-23,10,'#d9a268',7);line(12,0,23,10,'#d9a268',7);line(-5,-16,-2,-16,'#563726');line(3,-16,6,-16,'#563726');ctx.font='11px serif';ctx.fillStyle='#fff1ba';ctx.fillText('鸠摩智',0,39);ctx.restore();}
  function robot(x,y,boss=false,friendly=false){ctx.save();ctx.translate(x,y);ctx.scale(boss?2.2:1,boss?2.2:1);const c=friendly?'#62cadf':'#b75f42';oval(0,22,19,6,'#030d1a88');line(-8,11,-10,22,'#485771',7);line(8,11,10,22,'#485771',7);round(-15,-2,30,24,5,c,'#091425');round(-11,-25,22,24,6,friendly?'#aac8d4':'#79677a','#112139');round(-9,-18,18,7,2,friendly?'#5de4ff':'#ffad61');line(-17,0,-22,16,c,8);line(17,0,22,16,c,8);line(19,-6,19,12,'#becbd0',4);round(-8,3,16,9,2,'#23354d');ctx.restore();}
  function turret(x,y){ctx.save();ctx.translate(x,y);oval(0,20,39,9,'#26332b55');round(-32,5,64,26,7,'#424b48','#253530');for(let i=-24;i<30;i+=13)oval(i,20,5,5,'#87928a','#273731');round(-26,-9,52,32,8,'#6c7b64','#354c3a');round(-14,-19,28,28,6,'#8c997a','#3f5541');const target=enemies.find(e=>e.hp>0),angle=target?Math.atan2(target.x-x,y-target.y):0;ctx.rotate(angle);round(-5,-49,10,42,3,'#536654','#2c4132');round(-8,-54,16,9,2,'#35493c');if(player.shot>player.rate*.7){oval(0,-58,9,14,'#ffe29b');oval(0,-58,4,9,'#fff7db');}ctx.restore();}
  function background(){
    if(cfg.kind==='tiles'){
      ctx.fillStyle='#c8deb0';ctx.fillRect(0,0,W,H);ctx.fillStyle='#b2d397';ctx.beginPath();ctx.moveTo(0,60);ctx.quadraticCurveTo(90,3,210,63);ctx.quadraticCurveTo(340,-5,480,52);ctx.lineTo(480,0);ctx.lineTo(0,0);ctx.fill();
      for(let i=0;i<55;i++){const x=(i*83+17)%W,y=(i*137+42)%H;line(x,y,x-3,y-7,'#a4c589',1);line(x,y,x+4,y-6,'#a4c589',1);if(i%9===0)oval(x,y-9,2.5,2.5,'#fff2c7');}
      oval(66,570,35,14,'#adcb92');farmIcon(0,66,555,1.45);oval(408,570,29,12,'#adcb92');farmIcon(0,408,557,1.1);
    }else if(cfg.kind==='gates'){
      ctx.fillStyle='#101d31';ctx.fillRect(0,0,W,H);const offset=(time*75)%100;
      for(let y=-100;y<H;y+=100){line(0,y+offset,W,y+offset,'#263d55');for(let x=20;x<W;x+=80){round(x,y+offset+9,64,74,4,'#172940','#203951');line(x+6,y+offset+17,x+54,y+offset+17,'#344b62');}}
      for(const x of [30,65,415,450]){line(x,0,x,H,'#3db0c8',x===65||x===415?3:1);for(let y=-60;y<H;y+=130)round(x-4,y+offset,8,30,2,'#9fedff');}
      ctx.font='bold 13px monospace';ctx.fillStyle='#68bed7';ctx.fillText('ORBITAL FRONTIER · 星际防线',W/2,36);
    }else if(cfg.kind==='history'){

      ctx.fillStyle='#e5d3aa';ctx.fillRect(0,0,W,H);for(let y=0;y<H;y+=50){for(let x=-30;x<W;x+=90){round(x+(y%100?30:0),y,86,46,3,'#d8c9a6','#c4b68f');}}
      ctx.fillStyle='#bdaa83';ctx.fillRect(0,0,W,49);ctx.fillRect(0,0,21,H);ctx.fillRect(W-21,0,21,H);for(let x=0;x<W;x+=50)round(x,0,30,25,2,'#958363');
      for(const x of [42,W-42]){line(x,70,x,163,'#68543b',5);ctx.beginPath();ctx.moveTo(x,73);ctx.lineTo(x+34,83);ctx.lineTo(x+28,126);ctx.lineTo(x,116);ctx.closePath();ctx.fillStyle=x<100?'#7c9b81':'#b66c51';ctx.fill();ctx.fillStyle='#ecdfb9';ctx.font='bold 18px serif';ctx.fillText('战',x+16,104);}
      oval(W/2,H/2,160,190,'#b9a16b15');ctx.strokeStyle='#ad98642a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(W/2,H/2,150,180,0,0,Math.PI*2);ctx.stroke();
    }else{
      ctx.fillStyle='#9baba1';ctx.fillRect(0,0,W,H);ctx.fillStyle='#6e8079';ctx.fillRect(69,0,342,H);ctx.fillStyle='#778b81';ctx.fillRect(79,0,322,H);line(85,0,85,H,'#c4cec4',3);line(395,0,395,H,'#c4cec4',3);for(let y=-40;y<H;y+=100)round(233,y,14,54,1,'#c4c7a8');
      for(let i=0;i<17;i++){const x=(i*137+22)%W,y=(i*87+26)%H;line(x,y,x+12,y+5,'#5b71634d');line(x+12,y+5,x+5,y+13,'#5b71634d');}
      for(const x of [34,440]){round(x-15,77,30,24,4,'#b0a27a','#786f52');line(x-18,109,x+18,109,'#3b4940',4);}
      if(cfg.kind==='zombies'){ctx.fillStyle='#d5bd73';ctx.fillRect(0,H-92,W,12);for(let x=0;x<W;x+=30){ctx.fillStyle='#3b4940';ctx.beginPath();ctx.moveTo(x,H-92);ctx.lineTo(x+12,H-92);ctx.lineTo(x+24,H-80);ctx.lineTo(x+12,H-80);ctx.fill();}ctx.fillStyle='#576852';ctx.fillRect(0,H-80,W,80);for(let x=-10;x<W;x+=48){round(x,H-71,46,23,8,'#b8ae83','#706c4c');round(x+18,H-44,46,23,8,'#9d9773','#706c4c');}}
    }
  }
  // 2.5D presentation: game simulation remains in world coordinates.
  function project(x,y,z=0){if(cfg.view==='2d')return{x:W/2+x-player.x,y:H/2+y-player.y-z};return{x:W/2+.6*(x-player.x)-.32*(y-player.y),y:H/2+.24*(x-player.x)+.48*(y-player.y)-z};}
  function unproject(x,y){const dx=x-W/2,dy=y-H/2;if(cfg.view==='2d')return{x:player.x+dx,y:player.y+dy};return{x:player.x+(.48*dx+.32*dy)/.3648,y:player.y+(-.24*dx+.6*dy)/.3648};}
  function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
  function drawIsometric(){
    ctx.clearRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#63836b';ctx.fillRect(0,0,W,H);
    // Continuous world: camera follows the player, no platform edges or checkerboard.
    const seed=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
    for(let gy=Math.floor((player.y-1000)/90);gy<=Math.ceil((player.y+1000)/90);gy++)for(let gx=Math.floor((player.x-1000)/90);gx<=Math.ceil((player.x+1000)/90);gx++){
      const x=gx*90+seed(gx,gy)*65,y=gy*90+seed(gy,gx)*65,p=project(x,y);
      if(p.x<-80||p.x>W+80||p.y<-90||p.y>H+90)continue;
      const n=seed(gx+7,gy-4);oval(p.x,p.y,22+n*25,8+n*9,n>.45?'#759579':'#58775f');
      if(Math.abs(Math.sin(x/370)*170-y%700)<65)oval(p.x,p.y,35,15,'#a4a082');
      if(n>.88){oval(p.x,p.y,18,8,'#3a554655');oval(p.x,p.y-9,13,13,'#939d88','#576d5c');line(p.x-6,p.y-14,p.x+4,p.y-17,'#bec2a7',3);}
      else if(n<.12){for(let i=0;i<3;i++){line(p.x+i*6,p.y,p.x+i*6-5,p.y-54-i*10,'#325947',4);for(let j=0;j<3;j++)line(p.x+i*6-4,p.y-20-j*14,p.x+i*6+12,p.y-29-j*14,'#91b077',3);}}
      else if(n>.55){line(p.x,p.y,p.x-3,p.y-7,'#b0be89');line(p.x,p.y,p.x+5,p.y-8,'#b0be89');}
    }
    for(const e of enemies)if(e.boss&&e.warning>0){const p=project(e.attackX,e.attackY);oval(p.x,p.y,90*(cfg.view==='2d'?1:.7),90*(cfg.view==='2d'?1:.48),'#df73484d','#ffd781');ctx.font='bold 14px sans-serif';ctx.fillStyle='#fff4cc';ctx.fillText('降龙掌 · 立即躲开',p.x,p.y-12);}
    const visible=state==='ready'?[{x:player.x-170,y:player.y-130,boss:false},{x:player.x+190,y:player.y+70,boss:false},{x:player.x-70,y:player.y+230,boss:false}]:enemies;
    const objects=[...visible.map(e=>({type:'enemy',x:e.x,y:e.y,data:e})),{type:'player',x:player.x,y:player.y},...drops.map(d=>({type:'drop',x:d.x,y:d.y})),...knifePositions().map(k=>({type:'knife',...k}))].filter(o=>!building||(o.type==='player'?buildPhase>=2:o.type==='enemy'?buildPhase>=3:buildPhase>=4)).slice(0,revealCount()).sort((a,b)=>project(a.x,a.y).y-project(b.x,b.y).y);
    for(const o of objects){const p=project(o.x,o.y);if(o.type==='drop'){polygon([{x:p.x,y:p.y-8},{x:p.x+6,y:p.y-3},{x:p.x,y:p.y+2},{x:p.x-6,y:p.y-3}],'#51cab0','#258a79');continue;}
      if(o.type==='knife'){const elevated=project(o.x,o.y,25);oval(p.x,p.y,8,3,'#344e4c33');ctx.save();ctx.translate(elevated.x,elevated.y);ctx.rotate(o.angle+Math.PI/2);ctx.scale(edits.weapon?.scale||1,edits.weapon?.scale||1);polygon([{x:0,y:-18},{x:6,y:6},{x:0,y:2},{x:-6,y:6}],edits.weapon?.color||(player.quality>1?'#f3d894':'#d8f6f8'),'#527f86');line(0,6,0,15,'#7d5b39',4);ctx.restore();continue;}
      if(o.type==='player'){oval(p.x,p.y,24,10,'#51a99633');monk(p.x,p.y-22);}else{warrior(p.x,p.y-22,true);if(o.data.boss){ctx.font='bold 16px serif';ctx.fillStyle='#fff2c7';ctx.fillText('乔峰 · 最终宗师',p.x,p.y-76);round(p.x-30,p.y-64,60,5,2,'#645442');round(p.x-30,p.y-64,60*Math.max(0,o.data.hp)/o.data.max,5,2,'#ba6556');}}
    }
    for(const d of damageLabels){const p=project(d.x,d.y,32);ctx.globalAlpha=Math.max(0,d.life*1.5);ctx.font='bold 17px sans-serif';ctx.fillStyle='#ffe5a4';ctx.fillText(d.value,p.x,p.y);}ctx.globalAlpha=1;
    for(const particle of particles){const p=project(particle.x,particle.y,20);ctx.globalAlpha=Math.max(0,particle.life*2);ctx.fillStyle=particle.color;ctx.fillRect(p.x,p.y,4,4);}ctx.globalAlpha=1;
    if(building&&buildPhase<4)return;
    round(55,15,W-110,32,12,'#233e36bb');ctx.font='bold 17px serif';ctx.fillStyle='#fff1c9';ctx.fillText('鸠摩智转刀 · '+(cfg.view==='2d'?'2D':'2.5D')+'开放江湖',W/2,34);ctx.font='12px sans-serif';round(45,530,W-90,28,10,'#233e36bb');ctx.fillStyle='#fff1c9';ctx.fillText(bossSpawned?'乔峰已现身 · 注意红色掌法预警':'每5秒补充飞刀 · 拾取经验 · 60秒迎战乔峰',W/2,548);
    round(30,H-30,W-60,9,4,'#9baf9f');round(30,H-30,(W-60)*Math.min(1,player.xp/player.xpNeed),9,4,'#439f83');
    if(state==='paused'&&!upgrading){ctx.fillStyle='#23453666';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff7dc';ctx.font='bold 30px sans-serif';ctx.fillText('已暂停',W/2,H/2);}
  }
  function draw(){
    if(cfg.kind==='history'){drawIsometric();if(edits.scene?.color){ctx.fillStyle=edits.scene.color+'30';ctx.fillRect(0,0,W,H);}return;}
    if(cfg.kind==='zombies'&&expedition){expedition.render({player,enemies,bullets,gates,particles,time,state,kills,buildPhase:building?buildPhase:5,revealCount:revealCount()});return;}
    ctx.clearRect(0,0,W,H);ctx.textAlign='center';background();if(edits.scene?.color){ctx.fillStyle=edits.scene.color+'40';ctx.fillRect(0,0,W,H);}
    if(building&&buildPhase<2)return;
    if(cfg.kind==='tiles'){
      ctx.font='bold 17px sans-serif';ctx.fillStyle='#638058';ctx.fillText('三张一组  ·  羊群等你回家',W/2,67);
      for(const c of cards.slice(0,revealCount())){if(c.removed)continue;const r=rect(c),active=available(c);round(r.x,r.y+6,r.w,r.h,8,active?'#b5aa84':'#8d946e','#7e8868');round(r.x,r.y,r.w,r.h-2,8,active?'#fff8de':'#b9c2a3',active?'#7c8867':'#8d9878');if(active)round(r.x+4,r.y+3,r.w-8,4,2,'#ffffffb0');ctx.globalAlpha=active?1:.4;if(!building||buildPhase>=3)farmIcon(c.type,r.x+r.w/2,r.y+35,.85);ctx.globalAlpha=1;}
      if(building&&buildPhase<4)return;
      round(17,461,446,76,14,'#819d62','#68844e');round(23,464,434,62,10,'#b5cc93');for(let i=0;i<7;i++){round(29+i*61,473,54,45,7,'#e8e8bc','#94ac77');if(tray[i]!==undefined)farmIcon(tray[i],56+i*61,496,.68);}
      ctx.font='13px sans-serif';ctx.fillStyle='#6f8259';ctx.fillText('暂存槽 · 最多七张',W/2,559);
    }else{
      if(cfg.kind==='gates')for(const g of gates){if(g.used)continue;for(let lane=0;lane<2;lane++){const label=lane?g.right:g.left;round(22+lane*W/2,g.y,W/2-44,55,10,label.startsWith('-')?'#aa655d':'#4d927a','#f8e2a5');ctx.font='bold 27px sans-serif';ctx.fillStyle='#fff';ctx.fillText(label,W/4+lane*W/2,g.y+36);}}
      const visibleEnemies=state==='ready'?[{x:135,y:169,boss:false},{x:322,y:110,boss:false},{x:258,y:275,boss:false}]:enemies;
      for(const e of (building&&buildPhase<3?[]:visibleEnemies.slice(0,revealCount()))){if(cfg.kind==='history')warrior(e.x,e.y,true);else if(cfg.kind==='gates')robot(e.x,e.y,e.boss);else zombie(e.x,e.y,e.boss);if(e.boss){round(e.x-45,e.y-e.r-23,90,7,3,'#54473f');round(e.x-45,e.y-e.r-23,90*Math.max(0,e.hp)/e.max,7,3,'#d78463');}}
      for(const b of bullets){ctx.shadowBlur=8;ctx.shadowColor=cfg.kind==='history'?'#72b5bc':'#ffda84';line(b.x-b.vx*.02,b.y-b.vy*.02,b.x,b.y,cfg.kind==='history'?cfg.color:'#ffe79b',4);ctx.shadowBlur=0;}
      if(cfg.kind==='history'){
        for(const d of drops){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(Math.PI/4);round(-5,-5,10,10,2,'#63d7b8','#267d73');ctx.restore();}
        ctx.strokeStyle='#78b4a64d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y,player.orbitRadius,0,Math.PI*2);ctx.stroke();
        for(const k of knifePositions()){ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.angle+Math.PI/2);ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(6,6);ctx.lineTo(0,2);ctx.lineTo(-6,6);ctx.closePath();ctx.fillStyle=player.quality>1?'#f0d28a':'#d5f3f4';ctx.fill();ctx.strokeStyle='#507b81';ctx.stroke();line(0,5,0,14,'#775c3f',4);ctx.restore();}
        oval(player.x,player.y+6,29,24,'#64897630');warrior(player.x,player.y);
        round(30,H-22,W-60,8,4,'#a5997c');round(30,H-22,(W-60)*Math.min(1,player.xp/player.xpNeed),8,4,'#56b69d');
      }else if(cfg.kind==='zombies')turret(player.x,player.y);else{const n=Math.min(16,Math.ceil(player.army/3));for(let i=0;i<n;i++)robot(player.x+(i%4-1.5)*24,player.y+Math.floor(i/4)*25,false,true);}
      if(cfg.kind==='zombies'){round(25,H-21,180,8,4,'#334534');round(25,H-21,180*Math.max(0,player.hp)/150,8,4,'#bdd97e');ctx.font='12px sans-serif';ctx.fillStyle='#ebedcd';ctx.fillText('防线耐久',265,H-14);}
    }
    for(const p of particles){ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4);}ctx.globalAlpha=1;
    if(state==='paused'&&!upgrading){ctx.fillStyle='#19251799';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff7dc';ctx.font='bold 30px sans-serif';ctx.fillText('已暂停',W/2,H/2);}
  }
  function loop(now){const dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;if(state==='playing'&&!editing)step(dt);draw();drawSelection();frame=requestAnimationFrame(loop);}
  const position = e => {const r=canvas.getBoundingClientRect();const p={x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};return cfg.kind==='history'?unproject(p.x,p.y):p;};
  canvas.addEventListener('pointerdown',e=>{canvas.focus();const p=position(e);
    if(editing){if(cfg.kind==='zombies'&&expedition?.pick){selectElement(expedition.pick(e));return;}if(cfg.kind==='tiles'){selectedCard=[...cards].reverse().find(c=>!c.removed&&available(c)&&p.x>=rect(c).x&&p.x<=rect(c).x+rect(c).w&&p.y>=rect(c).y&&p.y<=rect(c).y+rect(c).h);selectElement(selectedCard?'cards':'scene');return;}const knife=cfg.kind==='history'&&knifePositions().some(k=>{const r=canvas.getBoundingClientRect(),q=project(k.x,k.y,25);return Math.hypot(q.x-(e.clientX-r.left)*W/r.width,q.y-(e.clientY-r.top)*H/r.height)<24;});selectedEnemy=(state==='ready'?[{x:player.x-170,y:player.y-130},{x:player.x+190,y:player.y+70},{x:player.x-70,y:player.y+230}]:enemies).find(n=>Math.hypot(n.x-p.x,n.y-p.y)<40);selectElement(knife?'weapon':Math.hypot(player.x-p.x,player.y-p.y)<40?'player':Boolean(selectedEnemy)?'enemy':'scene');return;}pointer={...p,down:true};canvas.setPointerCapture(e.pointerId);if(state==='playing'&&cfg.kind==='tiles')chooseCard(p.x,p.y);});
  canvas.addEventListener('pointermove',e=>{if(pointer.down)Object.assign(pointer,position(e));});
  for(const ev of ['pointerup','pointercancel'])canvas.addEventListener(ev,()=>pointer.down=false);
  document.addEventListener('keydown',e=>{if(document.activeElement!==canvas)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);if(cfg.kind==='zombies'&&['1','2','3'].includes(e.key))useSkill({1:'airstrike',2:'reinforce',3:'rally'}[e.key]);if(e.key===' '&&!e.repeat)pause();});
  document.addEventListener('keyup',e=>keys.delete(e.key));
  const loseFocus=()=>{keys.clear();pointer.down=false;if(state==='playing')pause();};window.addEventListener('blur',loseFocus);document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();});
  $('start').onclick=start;$('pause').onclick=pause;$('reset').onclick=init;
  $('undo').hidden=cfg.kind!=='tiles';$('undo').onclick=()=>{if(!history.length||state==='ended')return;const h=history.pop();cards.forEach((c,i)=>c.removed=h.removed[i]);tray=h.tray;moves=h.moves;updateHud();};
  for(const btn of $('choices').querySelectorAll('button'))btn.onclick=()=>{
    if(!upgrading)return;
    if(cfg.kind==='history'&&btn.dataset.up==='damage')player.knives=Math.min(9,player.knives+1);
    else if(cfg.kind==='history'&&btn.dataset.up==='rate')player.quality++;
    else if(cfg.kind==='gates'&&btn.dataset.up==='damage')player.army=Math.min(500,player.army+15);
    else if(cfg.kind==='gates'&&btn.dataset.up==='rate')player.army=Math.min(500,Math.ceil(player.army*1.3));
    else if(cfg.kind==='gates')player.army=Math.min(500,player.army+10);
    else if(cfg.kind==='zombies'&&btn.dataset.up==='damage'){player.damage+=10;player.army=Math.min(120,player.army+4);}
    else if(btn.dataset.up==='damage')player.damage+=10;
    else if(btn.dataset.up==='rate')player.rate=Math.max(.06,player.rate*.75);
    else player.hp=Math.min(200,player.hp+40);
    const name=btn.textContent;upgrades[name]=(upgrades[name]||0)+1;
    upgrading=false;$('choices').hidden=true;state='playing';last=performance.now();canvas.focus();updateHud();
  };
  function useSkill(id){if(state!=='playing'||skillCooldown[id]>0)return;
    if(id==='airstrike'){for(const e of enemies){e.hp-=200;spark(e.x,e.y,'#ffcc75');if(e.hp<=0)defeat(e);}enemies=enemies.filter(e=>e.hp>0);skillCooldown[id]=18;}
    if(id==='reinforce'){player.army=Math.min(120,player.army+10);player.hp=Math.min(200,player.hp+20);skillCooldown[id]=22;}
    if(id==='rally'){boost=8;skillCooldown[id]=20;}
    updateHud();canvas.focus();
  }
  for(const id of ['airstrike','reinforce','rally'])if($(id))$(id).onclick=()=>useSkill(id);
  const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);init();frame=requestAnimationFrame(loop);window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
})();
