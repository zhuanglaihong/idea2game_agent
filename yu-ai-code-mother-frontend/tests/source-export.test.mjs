import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto, createHash } from 'node:crypto';
const cache={};
function load(name){if(cache[name])return cache[name];const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(`src/demo/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{exports:mod.exports,require:n=>load(n.replace('./','')),crypto:webcrypto,TextEncoder,TextDecoder,btoa,atob});return cache[name]=mod.exports;}
const games=load('games'),exporter=load('sourceExport');
const runtime=fs.readFileSync('public/demo-games/runtime.js','utf8'),art=fs.readFileSync('public/demo-games/art-showcase.png');
for(const format of ['web-js','vite-ts']){
 const files=exporter.sourceFiles(games.makeWork('history'),runtime,art,format);
 const html=new TextDecoder().decode(files['index.html']);
 assert(html.includes('./assets/art-showcase.png'));assert(html.includes('"view":"2.5d"'));
 assert(files['src/game/runtime.js']);assert(files['README.md']);
 assert.deepEqual(Buffer.from(files[format==='vite-ts'?'public/assets/art-showcase.png':'assets/art-showcase.png']),art);
 if(format==='vite-ts'){assert(html.includes('type="module" src="/src/main.ts"'));assert(files['tsconfig.json']);assert(JSON.parse(new TextDecoder().decode(files['package.json'])).scripts.build.includes('tsc'));}
 else assert(html.includes('src="./src/game/runtime.js"'));
 if(process.env.WRITE_EXPORT_FIXTURES==='1'){const base=path.resolve('../tmp/export-check',format);for(const [name,data]of Object.entries(files)){const target=path.join(base,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}}
}
console.log('PASS: JS/TS工程目录、真实游戏运行时、素材打包、配置与启动脚本');

const resources=Object.fromEntries(load('publicAssets').publicAssetFiles.map(name=>[name,new Uint8Array(fs.readFileSync('public/demo-games/'+name))]));
const manifest=JSON.parse(new TextDecoder().decode(resources['space-kit/manifest.json']));assert.equal(manifest.license,'CC0-1.0');assert.equal(manifest.assets.length,9);
for(const asset of manifest.assets){const bytes=resources[asset.path];assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.equal(Buffer.from(bytes.subarray(0,4)).toString(),'glTF');}
for(const format of ['web-js','vite-ts']){const files=exporter.sourceFiles(games.makeWork('zombies'),runtime,art,format,resources);const html=new TextDecoder().decode(files['index.html']);const prefix=format==='vite-ts'?'public/':'';assert(html.includes('./assets/expedition-renderer.js'));assert(html.includes('"assetBase":"./assets/"'));assert(files[prefix+'assets/space-kit/astronautA.glb']);assert(files[prefix+'assets/space-kit/LICENSE.txt']);assert(files[prefix+'assets/THREE-LICENSE.txt']);if(process.env.WRITE_EXPORT_FIXTURES==='1'){const base=path.resolve('../tmp/export-check',format+'-3d');for(const [name,data]of Object.entries(files)){const target=path.join(base,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}}}
assert.throws(()=>exporter.sourceFiles(games.makeWork('zombies'),runtime,art,'web-js'),/模型与许可证/);console.log('PASS: 9个公开GLB哈希、CC0许可证、Three.js许可证及3D源码包完整性');
