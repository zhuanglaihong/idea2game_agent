import { build } from 'esbuild';
import fs from 'node:fs/promises';
await build({entryPoints:['src/demo/expeditionRenderer.js'],outfile:'public/demo-games/expedition-renderer.js',bundle:true,format:'iife',minify:true,target:'es2020',legalComments:'eof'});
await fs.copyFile('node_modules/three/LICENSE','public/demo-games/THREE-LICENSE.txt');
await fs.copyFile('src/demo/expeditionRenderer.js','public/demo-games/expedition-renderer.source.js');
console.log('Bundled Three.js expedition renderer for preview and offline source export.');
