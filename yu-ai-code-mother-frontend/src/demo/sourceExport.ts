import { gameHtml, normalizeWork, type GameWork } from './games'
import { artAssets } from './artAssets'

export type SourceFormat = 'web-js' | 'vite-ts' | 'single-html'
export function sourceFiles(work: GameWork, runtime: string, art: Uint8Array, format: 'web-js' | 'vite-ts', publicFiles:Record<string,Uint8Array>={}): Record<string, Uint8Array> {
 const encode=(text:string)=>new TextEncoder().encode(text)
 const w=normalizeWork(work)
 const files:Record<string,Uint8Array>={
  'game.json':encode(JSON.stringify(w,null,2)),
  'assets.json':encode(JSON.stringify({assets:artAssets.map(a=>({...a,path:'assets/art-showcase.png'})),note:'三个区域共用一张封面图集；游戏内绘制为Canvas。'},null,2)),
  '.gitignore':encode('node_modules/\ndist/\n'),
 }
 let html=gameHtml(w,'./src/game/runtime.js').split('./src/game/art-showcase.png').join('./assets/art-showcase.png')
 html=html.replace('"assetBase":"./src/game/"','"assetBase":"./assets/"')
 if(publicFiles['farm-atlas.png'])files[(format==='vite-ts'?'public/':'')+'assets/farm-atlas.png']=publicFiles['farm-atlas.png']
 if(w.kind==='zombies'){
  if(!publicFiles['expedition-renderer.js']||!publicFiles['space-kit/astronautA.glb']||!publicFiles['space-kit/LICENSE.txt'])throw Error('3D源码导出必须包含渲染器、模型与许可证')
  html=html.split('./src/game/space-kit/').join('./assets/space-kit/').split('./src/game/expedition-renderer.js').join('./assets/expedition-renderer.js').replace('"assetBase":"./src/game/"','"assetBase":"./assets/"')
  html=html.split('./src/game/reference/').join('./assets/reference/')
  for(const [name,bytes]of Object.entries(publicFiles))files[(format==='vite-ts'?'public/':'')+'assets/'+name]=bytes
  if(publicFiles['expedition-renderer.source.js'])files['src/game/expeditionRenderer.js']=publicFiles['expedition-renderer.source.js']
 }
 files['src/game/runtime.js']=encode(runtime)
 if(w.art)files[format==='vite-ts'?'public/assets/art-showcase.png':'assets/art-showcase.png']=art
 if(format==='vite-ts'){
  html=html.replace('<script src="./src/game/runtime.js"></script>','<script type="module" src="/src/main.ts"></script>')
  files['src/main.ts']=encode("import type { GameConfig } from './types'\nimport './game/runtime.js'\ndeclare global { interface Window { GAME_CONFIG: GameConfig } }\nexport const config: GameConfig = window.GAME_CONFIG\n")
  files['src/types.ts']=encode("export interface GameConfig { id:string; name:string; kind:'tiles'|'gates'|'zombies'|'history'; view:'2d'|'2.5d'; difficulty:number; speed:number; color:string; hero:string; art:boolean; updatedAt:string; previewStage?:number }\n")
  files['package.json']=encode(JSON.stringify({name:'idea2game-export',version:'1.0.0',private:true,type:'module',scripts:{dev:'vite',build:'tsc --noEmit && vite build',preview:'vite preview'},devDependencies:{vite:'7.0.4',typescript:'5.8.3'}},null,2))
  files['tsconfig.json']=encode(JSON.stringify({compilerOptions:{target:'ES2020',module:'ESNext',moduleResolution:'Bundler',lib:['ES2020','DOM'],strict:true,allowJs:true,checkJs:false,noEmit:true},include:['src']},null,2))
  files['vite.config.ts']=encode("export default { base: './' }\n")
 }
 files['index.html']=encode(html)
 files['README.md']=encode(`# ${w.name}\n\n${format==='vite-ts'?'TypeScript入口、类型声明与Vite构建工程，游戏运行时保留JavaScript。需要Node.js 22.12+；运行 npm install，然后 npm run dev。npm run build 生成 dist，发布 dist 整个目录。':'原生HTML + JavaScript + Canvas工程。打开index.html即可玩；需要服务器时运行 python -m http.server 8080，然后访问 http://localhost:8080。发布整个项目目录。'}\n\n源码位于src/game/runtime.js，参数内嵌于index.html，game.json提供参数快照。${w.art?'封面图片已包含，图集区域说明见assets.json。':'当前作品未使用封面图片。'}\n\n2.5D是斜视投影和深度排序，碰撞在二维世界坐标计算，触摸坐标反向映射。没有外部在线AI依赖。这是当前浏览器游戏的源码，非Unity或Godot工程。\n`)
 if(w.kind==='zombies'){
  files['assets.json']=encode(JSON.stringify({renderer:'Three.js / MIT',source:'https://kenney.nl/assets/space-kit',license:'CC0-1.0',files:Object.keys(publicFiles),manifest:'assets/space-kit/manifest.json'},null,2))
  files['README.md']=encode(new TextDecoder().decode(files['README.md'])+'\n本游戏使用真正的Three.js/WebGL渲染；WebGL不可用时降级Canvas。请通过HTTP服务器运行以加载本地GLB。模型、CC0许可证、Three.js MIT许可证、已构建渲染器及未压缩渲染源码均已包含。修改src/game/expeditionRenderer.js后，可安装three@0.186.1及esbuild，使用esbuild重新打包为IIFE到'+(format==='vite-ts'?'public/':'')+'assets/expedition-renderer.js。\n')
 }
 return files
}
