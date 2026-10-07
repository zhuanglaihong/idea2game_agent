// 在前端 npm run build:demo 成功后，准备可独立部署的公开 Demo。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const frontend=path.join(root,'yu-ai-code-mother-frontend');
const site=path.join(root,'demo-site');
const output=path.join(frontend,'dist-demo');
if(!fs.existsSync(path.join(output,'demo.html')))throw new Error('请先执行前端 npm run build:demo');
fs.mkdirSync(path.join(site,'dist'),{recursive:true});
fs.cpSync(output,path.join(site,'dist'),{recursive:true});
fs.copyFileSync(path.join(output,'demo.html'),path.join(site,'dist/index.html'));
const require=createRequire(path.join(frontend,'package.json'));
const ts=require('typescript'),gameModule={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(frontend,'src/demo/games.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:gameModule.exports,crypto:webcrypto,TextEncoder,TextDecoder,btoa,atob});
const {makeWork,gameHtml}=gameModule.exports;
for(const kind of ['tiles','zombies','history']){
 const overrides={};
 if(kind==='zombies')for(const folder of ['space-kit','reference/art','reference/fx'])for(const file of fs.readdirSync(path.join(output,'demo-games',folder))){if(!/\.(glb|png|webp)$/.test(file))continue;const name=folder+'/'+file;overrides[name]='data:'+(file.endsWith('.glb')?'model/gltf-binary':file.endsWith('.webp')?'image/webp':'image/png')+';base64,'+fs.readFileSync(path.join(output,'demo-games',name)).toString('base64');}
 let html=gameHtml(makeWork(kind),'/demo-games/runtime.js',5,overrides);
 const configScript=`<script>try{const encoded=new URLSearchParams(location.hash.slice(1)).get('work');if(encoded){const value=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))));if(value.kind===window.GAME_CONFIG.kind){for(const key of ['name','difficulty','speed','view','color','hero','art','elementEdits'])if(value[key]!==undefined)window.GAME_CONFIG[key]=value[key];}}}catch{}</script>`;
 html=html.replace('<script src=',configScript+'<script src=');
 for(const base of [path.join(site,'dist'),path.join(frontend,'public')]){const target=path.join(base,'play',kind);fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'index.html'),html);}
}
for(const file of ['src/demo/elementEditing.ts','src/demo/engines.ts','src/demo/unityExport.ts','scripts/build-game-renderer.mjs','src/demo/expeditionRenderer.js','src/demo/publicAssets.ts','src/components/CreatorHeader.vue','src/styles/creator-theme.css','src/pages/GameDemoPage.vue','src/demo/games.ts','src/demo/sourceExport.ts','src/demo/artAssets.ts','src/demo/replayScripts.ts','src/demo/useReplay.ts','src/demo-main.ts','public/demo-games/runtime.js','public/demo-games/art-showcase.png','tests/demo-games.test.mjs','tests/source-export.test.mjs','vite.demo.config.ts','demo.html']){
 const target=path.join(site,'source',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(frontend,file),target);
}
fs.writeFileSync(path.join(site,'README.md'),'# 小游戏工坊公开 Demo\n\n可玩模板、对话参数修改、本机作品保存和URL分享。未连接远端AI。发布目录dist；源码快照在source。完整平台代码位于yu-ai-code-mother主仓库。\n');
console.log('Demo公开文件及源码快照已准备完成，没有包含后端配置或密钥。');
