export type GameKind = 'tiles' | 'gates' | 'zombies' | 'history'
export interface GameWork {
  id: string
  name: string
  kind: GameKind
  difficulty: number
  speed: number
  color: string
  hero: string
  view: '2d' | '2.5d'
  art: boolean
  elementEdits?: Record<string, {color?:string;scale?:number;count?:number;speed?:number;hp?:number}>
  updatedAt: string
}
export const examples: { kind: GameKind; name: string; icon: string; description: string; prompt: string }[] = [
  { kind: 'tiles', name: '羊了个羊', icon: '🐑', description: '休闲益智 · 消除游戏', prompt: '请实现一个《羊了个羊》玩法的浏览器游戏。核心规则：多层卡牌遮挡，未被遮挡的牌可选，进入7格暂存槽，三个同类自动消除；槽满失败、清空牌堆胜利。采用卡通农场美术：浅绿草地、米白立体卡牌、羊和农作物图案。提供开始、暂停、撤回、重开及1—3档难度；用分组牌序保留合法通关路径，支持桌面点击与手机触摸，输出完整可运行游戏。' },
  { kind: 'zombies', name: '向僵尸开炮', icon: '🛡️', description: '动作射击 · 生存防守', prompt: '制作《向僵尸开炮》浏览器3D小队射击：采用倾斜透视战场、金属桥面、装甲部队和尸潮；左右移动选择增援路线，自动瞄准射击，每次命中、击败都要有反馈。提供作战简报、三种部队编成、数字门、兵力及防线HUD、三选一升级、空袭技能、暂停和战报。60秒后迎战首领，胜利可进入下一关。联网下载Kenney CC0的GLB模型，保存到项目素材库并附来源、许可证与哈希；支持源码下载和无需后端的公开试玩。' },
  { kind: 'history', name: '武侠大乱斗', icon: '⚔️', description: '动作生存 · 肉鸽元素', prompt: '制作《武侠大乱斗》：鸠摩智在连续开放竹林移动，镜头跟随，没有棋盘边界；敌人从四周生成并追击。飞刀快速环绕角色，接触造成伤害，每5秒自动增加一把、最多9把；击败敌人掉落经验，靠近吸附拾取，经验满暂停选择飞刀数量、品质或回复生命。60秒后出现最终Boss乔峰，范围掌法必须有明显预警并允许躲避。采用2.5D斜视投影、深度排序和原创红袍僧人美术；支持对话切换2D俯视版本。包含生命、等级、经验、飞刀属性、关卡、暂停、重开与键盘触摸操作。输出可直接试玩的完整游戏。' },
]
export function makeWork(kind: GameKind): GameWork {
  return { id: crypto.randomUUID(), name: examples.find(e => e.kind === kind)?.name || '数字远征', kind, difficulty: 1, speed: 1, color: '#7de4bf', hero: '弓将', view: kind === 'history' ? '2.5d' : '2d', art: kind !== 'gates', updatedAt: new Date().toISOString() }
}
export function normalizeWork(value: unknown): GameWork {
  if (!value || typeof value !== 'object') throw new Error('作品数据无效')
  const v = value as Partial<GameWork>
  if (!['tiles','gates','zombies','history'].includes(v.kind || '')) throw new Error('不支持的游戏类型')
  const base = makeWork(v.kind as GameKind)
  const elementEdits: NonNullable<GameWork['elementEdits']> = {}
  for(const id of ['player','weapon','enemy','scene','cards']) {
    const entry=v.elementEdits?.[id];if(!entry||typeof entry!=='object')continue
    elementEdits[id]={color:/^#[\da-f]{6}$/i.test(entry.color||'')?entry.color:undefined,scale:Math.min(2,Math.max(.5,Number(entry.scale)||1)),count:Math.min(9,Math.max(1,Number(entry.count)||1)),speed:Math.min(3,Math.max(.5,Number(entry.speed)||1)),hp:entry.hp===undefined?undefined:Math.min(500,Math.max(1,Number(entry.hp)||100))}
  }
  return { ...base, elementEdits, view: v.view === '2d' ? '2d' : v.view === '2.5d' ? '2.5d' : base.view, art: v.art !== false, id: typeof v.id === 'string' ? v.id.slice(0,80) : base.id, name: typeof v.name === 'string' && v.name.trim() ? v.name.slice(0,36) : base.name, difficulty: Math.min(3,Math.max(1,Number(v.difficulty)||1)), speed: Math.min(2,Math.max(.5,Number(v.speed)||1)), color: /^#[\da-f]{6}$/i.test(v.color || '') ? v.color! : base.color, hero: ['弓将','铁卫','谋士'].includes(v.hero || '') ? v.hero! : base.hero, updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : base.updatedAt }
}
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
export function gameHtml(work: GameWork, runtimeUrl: string, previewStage = 5, assetOverrides:Record<string,string> = {}): string {
  const w = normalizeWork(work)
  const artUrl = runtimeUrl.replace(/runtime\.js$/, "art-showcase.png")
  const position = w.kind === "tiles" ? "0%" : w.kind === "history" ? "100%" : "50%"
  const palette = (w.kind === "gates" || w.kind === "zombies") ? ["#0a1426","#14253c","#bce9fa","#287d9d"] : w.kind === "tiles" ? ["#dcedaf","#fffdf0","#345734","#91ba55"] : w.kind === "history" ? ["#d8c6a3","#faf0d9","#574432","#b17946"] : ["#6a7461","#ececdb","#303d32","#d4ae4d"]
  const assetBase = runtimeUrl.replace(/runtime\.js$/, '')
  const expedition = w.kind === 'zombies'
  const artConfig = {assetBase, assetOverrides}
  const briefing = expedition ? '<div class="mission-meta">EXPEDITION / 作战简报 <span>ONLINE</span></div><div class="commander"><img src="'+escape(assetBase)+'reference/ui/marine.webp" alt="参考站通讯头像"><div><b>灰烬远征 · 01</b><p>尸潮正在逼近。指挥装甲部队，选择增援路线，守住长桥。</p></div></div><div class="roster"><label>部队编成<select id="squad"><option value="standard">标准小队 · 均衡</option><option value="heavy">重装小队 · 生命 +50</option><option value="rapid">突击小队 · 射速 +25%</option></select></label></div>' : ''
  const expeditionCss = expedition ? 'body{background:#070f18;color:#b7c7ce}.shell{max-width:650px;border:1px solid #697984;border-radius:3px;background:#0b1721;box-shadow:0 0 35px #0008}.shell header{background:linear-gradient(#213341,#111e2a);color:#cedce3;border-bottom:2px solid #51636b;font:12px monospace;padding:14px}.level{background:#101e29;color:#debc75;border-color:#344755;letter-spacing:2px}.card{background:linear-gradient(135deg,#1b2e3d,#09131c);color:#d6e1e7;border:2px solid #69737a;border-radius:3px;box-shadow:inset 0 0 0 5px #101c26,0 14px 45px #0009;padding:24px;text-align:left}.card h1{font-size:26px;color:#e6c77a;letter-spacing:2px;text-shadow:0 2px #000}.card p{color:#9fb5c2;font-size:13px}.card button{background:linear-gradient(#70562b,#3d2f17);border:1px solid #caa750;box-shadow:0 0 16px #bb923133;color:#ffe6ab;border-radius:3px;min-height:45px}#start{display:block;width:100%;font-size:20px;letter-spacing:4px}.mission-meta{font:10px monospace;color:#a2b2bb;border-bottom:1px solid #485865;padding-bottom:10px}.mission-meta span{float:right;color:#add283}.commander{display:flex;gap:12px;margin:15px 0}.commander img{width:82px;height:96px;object-fit:contain;background:#203645;border:1px solid #566976}.commander b{font-size:20px;color:#ead29a}.roster select{display:block;width:100%;background:#101d28;color:#b9c9d4;border:1px solid #50616d;padding:10px;margin:8px 0 16px}.traits{background:#101e29;color:#b1cad3;border-top:1px solid #3c5365}.buttons{background:#101d28}.buttons button{background:#1e3446;border:1px solid #466274;color:#c1d8e3;border-radius:3px}.hint{color:#778f9d}.asset-status{background:#0c1721;color:#7e9eaa;padding:7px;font:10px monospace}.skills{display:flex;gap:8px;padding:9px;background:#0c1721}.skills button{flex:1;background:#283b47;border:1px solid #596a67;color:#ddcba2;border-radius:3px;font-size:12px;padding:9px 4px}.overlay{background:#040b1266;backdrop-filter:blur(2px)}.choices button{flex:1}.choices{align-items:stretch}' : ''
  return `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(w.name)}</title><style>*{box-sizing:border-box}body{margin:0;background:${palette[0]};color:${palette[2]};font:14px system-ui;text-align:center}.shell{max-width:480px;margin:auto;position:relative}header{padding:12px;display:flex;justify-content:space-between;gap:8px;background:${palette[1]}}canvas{width:100%;height:auto;display:block;touch-action:none;outline:none}.buttons{display:flex;gap:10px;justify-content:center;padding:10px}button{padding:10px 18px;border:0;border-radius:8px;background:${palette[3]};color:${palette[2]};cursor:pointer;font:inherit;font-weight:600}.overlay{position:absolute;inset:50px 0 55px;display:flex;align-items:center;justify-content:center;background:#26342565;backdrop-filter:blur(5px);padding:24px}.card{width:100%;padding:26px;background:${palette[1]};border:3px solid ${palette[3]};border-radius:18px;line-height:1.8}h1{font-size:28px}p{color:${palette[2]}}.choices{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}[hidden]{display:none!important}.hint{font-size:12px;color:${palette[2]};margin:0 0 12px}button:disabled{opacity:.45;cursor:default}.card{box-shadow:0 12px 0 #0002,0 24px 45px #0003}.card h1{font-size:36px;font-weight:900;letter-spacing:3px}.shell{border:4px solid ${palette[3]};border-radius:20px;overflow:hidden}canvas{${previewStage===2?"filter:grayscale(1);opacity:.65":""}}.level{font-size:12px;padding:7px;background:${palette[1]};border-bottom:1px solid ${palette[3]}}.traits{padding:10px 12px;background:${palette[1]};font-size:12px;line-height:1.7;min-height:40px;text-align:left}.cover-art{height:160px;border-radius:12px;background-image:url("${escape(artUrl)}");background-size:300% auto;background-position:${position} ${w.kind === "history" ? "30%" : "56%"};margin-bottom:16px}${expeditionCss}</style><div class="shell"><header><span id="stats"></span><span id="best"></span></header><div id="level" class="level"></div><div id="battlefield" style="position:relative"><canvas id="game" tabindex="0" aria-label="${escape(w.name)}，点击后可用键盘或触摸操作"></canvas></div>${expedition?'<div class="skills"><button id="airstrike">[1] 空袭</button><button id="reinforce">[2] 增援</button><button id="rally">[3] 鼓舞</button></div><div id="assetStatus" class="asset-status">本地素材：Kenney CC0 · 暴雪模型未接入</div>':''}<div class="buttons"><button id="pause">暂停</button><button id="reset">重开</button><button id="undo">撤回一步</button></div><div id="traits" class="traits"></div><p class="hint">${w.kind==='tiles'?'点击图案 · 七格暂存槽':'键盘方向键 / WASD 或按住拖动 · 空格暂停'}</p><div id="cover" class="overlay"><div class="card">${briefing}${w.art&&!expedition?'<div class="cover-art" aria-label="AI生成封面素材"></div>':''}<h1 id="coverTitle"></h1><p id="coverText"></p><button id="start">开始游戏</button></div></div><div id="choices" class="overlay" hidden><div class="card"><h1>选择一个强化</h1><p>战斗已暂停，选好后继续</p><div class="choices"><button data-up="damage">攻击 +10</button><button data-up="rate">射速 +25%</button><button data-up="heal">回复 40 生命</button></div></div></div></div><script>window.GAME_CONFIG=${JSON.stringify({...w,previewStage,...artConfig}).replace(/</g,'\\u003c')}</script>${expedition&&previewStage>=1?'<script src="'+escape(assetBase)+'expedition-renderer.js"></script>':''}<script src="${escape(runtimeUrl)}"></script></html>`
}
export function buildPreview(work: GameWork, runtimeUrl: string, stage: number, assetOverrides:Record<string,string> = {}): string {
 if(stage>=1)return gameHtml(work,runtimeUrl,stage,assetOverrides)
 return `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#f7f8f2;color:#4b5b46;font:15px system-ui;padding:30px}.screen{border:2px dashed #cbd5bf;border-radius:22px;min-height:580px;padding:24px;text-align:center}.icon{font-size:55px;margin:70px 0 20px}h1{font-size:26px}.bar{height:35px;background:#e3e9d9;border-radius:10px;margin:14px 0}.board{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:40px 0}.cell{height:80px;background:#e3e9d9;border-radius:14px}p{line-height:1.8;color:#85927b}</style><div class="screen">${stage===0?'<div class="icon">✦</div><h1>从想法开始构建</h1><p>正在分析玩法与美术方向<br>界面将在执行记录推进时逐步出现</p>':`<div class="bar"></div><h1>${escape(work.name)}</h1><div class="board">${'<div class="cell"></div>'.repeat(9)}</div><div class="bar"></div><p>界面骨架已就绪 · 正在绘制场景与角色</p>`}</div>`
}
export function encodeWork(w: GameWork): string {
  const bytes = new TextEncoder().encode(JSON.stringify(normalizeWork(w)))
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
}
export function decodeWork(s: string): GameWork {
  if (s.length > 8000) throw new Error('分享数据过长')
  return normalizeWork(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))))
}
