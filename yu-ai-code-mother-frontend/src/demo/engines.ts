export const engines = [
 {id:'web',name:'网页 · Canvas / Three.js',status:'已接入',description:'当前三个案例；即时试玩，下载完整JS/TS工程。',output:'HTML + JS + 图片/模型',url:'https://threejs.org/'},
 {id:'phaser',name:'Phaser · 2D网页游戏',status:'待接入',description:'适合消除、转刀、平台跳跃；可与Vue界面共存。',output:'JS/TS + 资源 → Web',url:'https://phaser.io/'},
 {id:'godot',name:'Godot · 2D / 3D',status:'待接入',description:'需要Godot与导出模板；GDScript工程编译为网页。',output:'project.godot + GDScript → Web',url:'https://godotengine.org/'},
 {id:'unity',name:'Unity · C#',status:'原型源码可下载',description:'转刀基础原型与Web构建入口；本机未安装Editor，尚未编译验证。',output:'Assets + Packages + ProjectSettings → Web',url:'https://unity.com/'},
 {id:'flash',name:'Flash旧作 · Ruffle',status:'待接入',description:'用于兼容已有SWF；兼容性需逐个验证，新游戏优先HTML5。',output:'SWF + Ruffle网页播放器',url:'https://ruffle.rs/'},
] as const
export type EngineId = typeof engines[number]['id']
export function enginePlan(id:EngineId,game:string){const engine=engines.find(e=>e.id===id)!;return JSON.stringify({game,engine:id,status:engine.status,source:engine.output,preview:id==='web'?'current-demo':'current-demo-remains-web; selected-engine-not-running',steps:['生成对应引擎工程','导入带来源的素材','运行引擎构建并读取日志','在隔离预览中测试Web输出','发布Web构建目录到Cloudflare或其他静态托管'],cloudflare:{requires:'用户自己的Cloudflare账号与部署授权',note:'发布Web构建产物；不是上传C#或GDScript就能运行。Unity/Godot较大文件需检查托管限制。'}},null,2)}
