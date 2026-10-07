export const publicAssetFiles = ['reference/art/terran-deck.webp','reference/ui/marine.webp','reference/fx/droppod-scorch.png','reference/manifest.json','reference/SOURCES.txt','expedition-renderer.js','expedition-renderer.source.js','THREE-LICENSE.txt','space-kit/LICENSE.txt','space-kit/manifest.json',...['astronautA','astronautB','alien','rover','turret_double','weapon_rifle','craft_speederA','platform_straight','rock_largeA'].flatMap(name=>[`space-kit/${name}.glb`,`space-kit/${name}.png`])]
export const modelAssets = [
 {id:'astronautA',name:'装甲步兵',path:'space-kit/astronautA.glb',preview:'space-kit/astronautA.png',use:'自动射击小队'},
 {id:'alien',name:'异变敌人',path:'space-kit/alien.glb',preview:'space-kit/alien.png',use:'尸潮与首领'},
 {id:'rover',name:'装甲战车',path:'space-kit/rover.glb',preview:'space-kit/rover.png',use:'增援部队'},
] as const
export function dataUri(bytes:Uint8Array,mime:string):string {
 let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192))
 return `data:${mime};base64,${btoa(raw)}`
}
