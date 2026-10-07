// Repeatable import from the publisher's public CC0 archive. Never scrape arbitrary URLs.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { unzipSync } from '../yu-ai-code-mother-frontend/node_modules/fflate/esm/index.mjs';
const root=path.resolve(import.meta.dirname,'..');
const url='https://kenney.nl/media/pages/assets/space-kit/20874c75ac-1677698978/kenney_space-kit.zip';
const cached=path.join(root,'tmp/kenney-space-kit.zip');
let bytes;try{bytes=await fs.readFile(cached)}catch{const response=await fetch(url);if(!response.ok)throw Error(`Asset download failed: ${response.status}`);bytes=new Uint8Array(await response.arrayBuffer());await fs.mkdir(path.dirname(cached),{recursive:true});await fs.writeFile(cached,bytes)}
const archive=unzipSync(bytes), names=['astronautA','astronautB','alien','rover','turret_double','weapon_rifle','craft_speederA','platform_straight','rock_largeA'];
const output=path.join(root,'yu-ai-code-mother-frontend/public/demo-games/space-kit');await fs.mkdir(output,{recursive:true});
const records=[];
for(const name of names){const source=`Models/GLTF format/${name}.glb`,data=archive[source];if(!data)throw Error(`Missing ${source}`);await fs.writeFile(path.join(output,`${name}.glb`),data);records.push({id:name,path:`space-kit/${name}.glb`,format:'GLB',bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),source:'https://kenney.nl/assets/space-kit',license:'CC0-1.0',downloadedAt:'2026-10-07'});const preview=archive[`Isometric/${name}_NE.png`];if(preview)await fs.writeFile(path.join(output,`${name}.png`),preview);}
await fs.writeFile(path.join(output,'LICENSE.txt'),archive['License.txt']);
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({publisher:'Kenney',source:url,license:'CC0-1.0',assets:records},null,2));
console.log(`Imported ${records.length} public GLB models with source, license and SHA256.`);
