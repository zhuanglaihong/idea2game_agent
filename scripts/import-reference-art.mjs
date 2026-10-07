import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root=new URL('../yu-ai-code-mother-frontend/public/demo-games/',import.meta.url);
const reference=['art/terran-deck.webp','ui/marine.webp','fx/droppod-scorch.png'];
const records=[];
const mapping=await fs.readFile(new URL('../tmp/reference-assets.js',import.meta.url),'utf8');
const versions=Object.fromEntries([...mapping.matchAll(/"(\/assets\/[^"\n]+)":`([a-f0-9]+)`/g)].map(m=>[m[1],m[2]]));
for(const path of reference){const url='https://starcraft-shooter-2026.pages.dev/assets/'+path+'?v='+versions['/assets/'+path];const r=await fetch(url);if(!r.ok)throw Error(`${r.status}: ${url}`);const bytes=Buffer.from(await r.arrayBuffer());const out=new URL('reference/'+path,root);await fs.mkdir(new URL('.',out),{recursive:true});await fs.writeFile(out,bytes);records.push({path:'reference/'+path,source:url,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,rights:path.startsWith('models/')?'Blizzard Entertainment / respective community authors; no redistribution license verified':'Ji / reference site; no redistribution license verified'});console.log(path,bytes.length);}
await fs.writeFile(new URL('reference/manifest.json',root),JSON.stringify({notice:'Imported at user request for a non-official demonstration. Attribution is not a license grant. Do not describe these resources as CC0 or independently licensed.',assets:records},null,2));
await fs.writeFile(new URL('reference/SOURCES.txt',root),'Reference: https://starcraft-shooter-2026.pages.dev/assets/credits\nStarCraft models and textures: Blizzard Entertainment and respective community authors. Environment texture and communication portrait: Ji / reference author (AI generated). Non-official demonstration. No independent redistribution license verified; attribution does not confer authorization.\n');
