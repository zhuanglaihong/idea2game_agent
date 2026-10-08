import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
const runtime=fs.readFileSync('public/demo-games/runtime.js','utf8');
function game(kind,difficulty=1,previewStage=5){
 const handlers={},els={};let now=0;
 let drawCalls=0;
 const context=new Proxy({}, {get:(target,key)=>target[key]||(()=>{drawCalls++}),set:(t,k,v)=>(t[k]=v,true)});
 for(const id of ['game','stats','best','choices','pause','cover','coverTitle','coverText','start','reset','undo','level','traits','airstrike','reinforce','rally']) els[id]={hidden:false,textContent:'',onclick:null};
 els.game={...els.game,style:{},getContext:()=>context,focus:()=>{doc.activeElement=els.game},addEventListener:(name,fn)=>handlers[name]=fn,setPointerCapture:()=>{},getBoundingClientRect:()=>({left:0,top:0,width:480,height:620})};
 const choices=['damage','rate','heal'].map(up=>({dataset:{up}}));els.choices.querySelectorAll=()=>choices;
 const doc={getElementById:id=>els[id],activeElement:null,addEventListener:(name,fn)=>handlers['document:'+name]=fn};
 const parent={postMessage:data=>handlers.selected=data};const sandbox={parent,window:{GAME_CONFIG:{kind,view:'2.5d',previewStage,name:'test',difficulty,speed:1,color:'#7de4bf',hero:'弓将'},devicePixelRatio:1,addEventListener:(name,fn)=>handlers['window:'+name]=fn},document:doc,performance:{now:()=>now},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},localStorage:{getItem:()=>null,setItem:()=>{}},Math,console};
 vm.runInNewContext(runtime.replace('init();frame=requestAnimationFrame(loop);','window.inspect={snapshot:()=>({state,time,player,cards,tray,enemies,gates,kills,upgrading,bullets,drops,diff,boost,skillCooldown}),project,unproject,step,draw,enemy,chooseCard,available,knifePositions,setTime:v=>time=v,setEnemies:v=>enemies=v,setDrops:v=>drops=v,setGates:v=>gates=v,setKills:v=>kills=v};init();frame=requestAnimationFrame(loop);'),sandbox);
 return{els,handlers,choices,api:sandbox.window.inspect,drawCalls:()=>drawCalls,tick(dt){now+=dt*1000;if(sandbox.window.inspect.snapshot().state==='playing')sandbox.window.inspect.step(dt)}};
}
for(let attempt=0;attempt<12;attempt++){
 const g=game('tiles',attempt%3+1);g.els.start.onclick();const {cards}=g.api.snapshot();
 // 每层全部图案可按三张一组完成，验证随机牌局存在通关路径。
 for(let layer=attempt%3+1;layer>=0;layer--)for(let type=0;type<6;type++)for(const c of cards.filter(c=>c.layer===layer&&c.type===type)){assert(g.api.available(c));g.api.chooseCard(24+(c.slot%6)*70+c.layer*3+30,112+Math.floor(c.slot/6)*86-c.layer*3+35);assert(g.api.snapshot().tray.length<7)}
 assert.equal(g.api.snapshot().state,'ended');assert.equal(g.els.coverTitle.textContent,'挑战成功！');
 if(attempt%3===0)assert(g.els.start.textContent.includes('第 2 关'));g.els.start.onclick();assert.equal(g.api.snapshot().diff,Math.min(3,attempt%3+2));assert.equal(g.api.snapshot().tray.length,0);assert.equal(g.api.snapshot().cards.filter(c=>c.removed).length,0);
}
const tiles=game('tiles');tiles.els.start.onclick();const top=tiles.api.snapshot().cards.find(c=>tiles.api.available(c));tiles.api.chooseCard(24+(top.slot%6)*70+top.layer*3+30,112+Math.floor(top.slot/6)*86-top.layer*3+35);tiles.els.undo.onclick();assert.equal(tiles.api.snapshot().tray.length,0);assert.equal(top.removed,false);
const runner=game('gates');runner.els.start.onclick();runner.api.snapshot().player.x=100;runner.api.setGates([{y:510,left:'×2',right:'-5',used:false}]);runner.tick(.01);assert.equal(runner.api.snapshot().player.army,24);runner.tick(.01);assert.equal(runner.api.snapshot().player.army,24,'数字门不可重复结算');runner.els.pause.onclick();const paused=runner.api.snapshot().time;runner.tick(2);assert.equal(runner.api.snapshot().time,paused);runner.els.reset.onclick();assert.equal(runner.api.snapshot().player.army,12);assert.equal(runner.api.snapshot().time,0);
const battle=game('history');battle.els.start.onclick();battle.api.setKills(10);battle.tick(.01);assert.equal(battle.api.snapshot().upgrading,false,'击杀数不直接触发武侠升级');assert.equal(battle.api.snapshot().bullets.length,0,'武侠没有发射子弹');
const blade=battle.api.knifePositions()[0];battle.api.setEnemies([{x:blade.x,y:blade.y,hp:1,max:1,r:14,speed:0,boss:false}]);battle.tick(.01);assert.equal(battle.api.snapshot().enemies.length,0);assert.equal(battle.api.snapshot().drops.length,1,'飞刀击杀掉落经验');
const hero=battle.api.snapshot().player;battle.api.setDrops([{x:hero.x,y:hero.y,value:hero.xpNeed}]);battle.tick(.01);assert.equal(battle.api.snapshot().upgrading,true);assert.equal(hero.level,2);battle.choices[0].onclick();assert.equal(hero.knives,2);assert.equal(battle.api.snapshot().state,'playing');
battle.api.setDrops([{x:hero.x,y:hero.y,value:hero.xpNeed}]);battle.tick(.01);battle.choices[1].onclick();assert.equal(hero.quality,2);battle.handlers['window:blur']();assert.equal(battle.api.snapshot().state,'paused');battle.els.reset.onclick();assert.equal(battle.api.snapshot().player.knives,1);assert.equal(battle.api.snapshot().drops.length,0);
const source=ts.transpileModule(fs.readFileSync('src/demo/games.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod={exports:{}};vm.runInNewContext(source,{exports:mod.exports,crypto:webcrypto,TextEncoder,TextDecoder,btoa,atob,URL,console});const api=mod.exports;const work=api.makeWork('history');work.name='测试中文 🎮 </script>';const restored=api.decodeWork(api.encodeWork(work));assert.equal(restored.name,work.name);assert.equal(restored.kind,'history');assert(!api.gameHtml(work,'/runtime.js').includes('🎮 </script>'));assert.throws(()=>api.decodeWork('invalid'));assert.throws(()=>api.normalizeWork({kind:'invalid'}));
const locked=game('zombies',1,3);locked.els.start.onclick();assert.equal(locked.api.snapshot().state,'ready');assert.equal(locked.els.start.disabled,true);
const defense=game('zombies');assert.equal(defense.api.snapshot().player.hp,150);defense.els.start.onclick();defense.api.setKills(10);defense.tick(.01);assert.equal(defense.api.snapshot().upgrading,true);const oldRate=defense.api.snapshot().player.rate;defense.choices[1].onclick();assert(defense.api.snapshot().player.rate<oldRate);assert(defense.els.traits.textContent.includes('射速 +25% ×1'));defense.els.reset.onclick();assert.equal(defense.api.snapshot().player.hp,150);assert.equal(defense.api.snapshot().kills,0);
assert(api.buildPreview(work,'/runtime.js',0).includes('从想法开始构建'));assert(api.buildPreview(work,'/runtime.js',1).includes('\"previewStage\":1'));assert(api.buildPreview(work,'/runtime.js',3).includes('\"previewStage\":3'));
console.log('PASS: 构建阶段禁止开玩、守城生命与射速强化、')
const phaseDraws=[1,2,3,4].map(phase=>{const g=game('history',1,phase);g.tick(10);g.api.draw();assert.equal(g.els.start.disabled,true);return g.drawCalls()});
for(let i=1;i<phaseDraws.length;i++)assert(phaseDraws[i]>phaseDraws[i-1],'场景、角色、敌人、飞刀阶段应逐步增加实际绘制元素');
console.log('PASS: 实际构建画面分阶段增加场景、角色、敌人与武器，完成前保持禁止游玩');
console.log('PASS: 12随机叠层牌局通关、撤回、重开、数字门单次结算、暂停冻结、飞刀碰撞、掉落拾取、数量品质升级与失焦暂停、中文作品分享还原和数据校验');

for(const [x,y] of [[20,45],[240,310],[460,565]]){const p=battle.api.project(x,y);const r=battle.api.unproject(p.x,p.y);assert(Math.abs(r.x-x)<1e-7&&Math.abs(r.y-y)<1e-7)}
assert.equal(api.makeWork('history').view,'2.5d');assert.equal(api.normalizeWork({...api.makeWork('history'),view:'2d'}).view,'2d');console.log('PASS: 2.5D投影反变换、2D保存分享兼容');

const world=game('history');world.els.start.onclick();const p=world.api.snapshot().player;
p.x=2200;p.y=-1500;world.tick(.01);assert.equal(p.x,2200);assert.equal(p.y,-1500,'开放地形不再被画布边缘限制');
world.api.setEnemies([]);for(let i=0;i<50;i++)world.api.enemy();const sides=new Set(world.api.snapshot().enemies.map(e=>(e.x>p.x?'R':'L')+(e.y>p.y?'D':'U')));assert.equal(sides.size,4,'敌人应覆盖四个方向');
world.api.setEnemies([]);world.api.setTime(60);world.tick(.01);const boss=world.api.snapshot().enemies.find(e=>e.boss);assert(boss);assert(Math.hypot(boss.x-p.x,boss.y-p.y)<300,'Boss在当前世界位置附近出现');
boss.attackClock=0;world.tick(.01);assert(boss.warning>0);const beforeHp=p.hp;p.x+=200;for(let i=0;i<35;i++)world.tick(.033);assert.equal(p.hp,beforeHp,'预警期间移出范围可躲避掌法');world.api.draw();
const sci=game('gates');sci.els.start.onclick();sci.api.setKills(10);sci.tick(.01);assert(sci.api.snapshot().upgrading);const beforeArmy=sci.api.snapshot().player.army;sci.choices[0].onclick();assert.equal(sci.api.snapshot().player.army,beforeArmy+15);sci.api.draw();
assert.equal(api.examples.length,3);assert(!api.examples.some(e=>e.kind==='gates'));console.log('PASS: 开放世界坐标、四面来敌、世界Boss生成、范围掌法预警与躲避、隐藏额外科幻案例与画面绘制');

const skills=game('zombies');assert.equal(skills.els.airstrike.disabled,true);skills.els.start.onclick();skills.api.setEnemies([{x:100,y:100,hp:180,max:180,r:14,speed:0,boss:false}]);skills.els.airstrike.onclick();assert.equal(skills.api.snapshot().enemies.length,0);assert.equal(skills.api.snapshot().kills,1);assert.equal(skills.api.snapshot().skillCooldown.airstrike,18);skills.api.setEnemies([{x:100,y:100,hp:300,max:300,r:14,speed:0,boss:false}]);skills.els.airstrike.onclick();assert.equal(skills.api.snapshot().enemies[0].hp,300,'冷却期间不能重复施放');const army=skills.api.snapshot().player.army;skills.els.reinforce.onclick();assert.equal(skills.api.snapshot().player.army,army+10);skills.els.rally.onclick();assert.equal(skills.api.snapshot().boost,8);skills.tick(.01);assert(skills.api.snapshot().bullets[0].damage>skills.api.snapshot().player.damage);skills.els.pause.onclick();const cd=skills.api.snapshot().skillCooldown.airstrike;skills.tick(2);assert.equal(skills.api.snapshot().skillCooldown.airstrike,cd);skills.els.reset.onclick();assert.equal(skills.api.snapshot().skillCooldown.airstrike,0);
const timedBlades=game('history');timedBlades.els.start.onclick();for(let i=0;i<160;i++){timedBlades.api.setEnemies([]);timedBlades.tick(.033)}assert.equal(timedBlades.api.snapshot().player.knives,2,'原版方向：随时间自动补充飞刀');console.log('PASS: 空袭伤害与冷却、增援兵力、鼓舞攻击、暂停技能冻结和自动补充飞刀');

const selectedGame=game('history');selectedGame.els.start.onclick();selectedGame.handlers['window:message']({source:{},data:{type:'idea2game:edit-mode',enabled:true}});assert.equal(selectedGame.api.snapshot().state,'playing','忽略其它窗口编辑指令');
// 游戏回调仅接受父页面；使用同一个父窗口对象测试选择与冻结。
const editMod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/demo/elementEditing.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:editMod.exports});
const edited=editMod.exports.editGameElement(api.makeWork('history'),{id:'weapon',name:'飞刀'},'增加2把，改成金色，转速提高20%').work;assert.equal(edited.elementEdits.weapon.count,3);assert.equal(edited.elementEdits.weapon.speed,1.2);assert.equal(edited.elementEdits.weapon.color,'#ffd166');const roundTrip=api.decodeWork(api.encodeWork(edited));assert.equal(roundTrip.elementEdits.weapon.count,3);assert.equal(roundTrip.elementEdits.player,undefined);assert.equal(api.normalizeWork({...edited,elementEdits:{player:{color:'#ffd166'}}}).elementEdits.player.hp,undefined);console.log('PASS: 定向飞刀修改、分享保存还原、无关对象保持、消息来源校验');
