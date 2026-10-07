import type { GameWork } from './games'

export type GameElement = { id: 'player' | 'weapon' | 'enemy' | 'scene' | 'cards'; name: string }
export const gameElements: GameElement[] = [
  {id:'player',name:'玩家角色'}, {id:'weapon',name:'武器'},
  {id:'enemy',name:'敌人'}, {id:'scene',name:'场景'}, {id:'cards',name:'卡牌'},
]
export function editGameElement(work: GameWork, target: GameElement, text: string) {
  const edits = {...work.elementEdits}, value = {...edits[target.id]}, changes: string[] = []
  const colors: Record<string,string> = {'金':'#ffd166','红':'#ef6464','蓝':'#71b7ff','紫':'#a78bfa','绿':'#7de4bf'}
  if(target.id!=='cards')for(const [name,color] of Object.entries(colors)) if(text.includes(name+'色')) {value.color=color;changes.push('颜色');break}
  if(target.id!=='scene'&&/放大|大一点/.test(text)){value.scale=Math.min(2,(value.scale||1)*1.2);changes.push('放大20%')}
  if(target.id!=='scene'&&/缩小|小一点/.test(text)){value.scale=Math.max(.5,(value.scale||1)*.8);changes.push('缩小20%')}
  if(target.id==='weapon' && work.kind==='history') {
    const count=text.match(/(?:增加|加)(\d+)把/)
    if(count){value.count=Math.min(9,(value.count||1)+Number(count[1]));changes.push('飞刀数量')}
    if(/快|提高|加速/.test(text)){value.speed=Math.min(3,(value.speed||1)*1.2);changes.push('转速提高20%')}
  }
  if(target.id==='player') {const hp=text.match(/生命(?:值)?(?:设为|改为)?\s*(\d+)/);if(hp){value.hp=Math.min(500,Math.max(1,Number(hp[1])));changes.push('生命值')}}
  return {work:{...work,elementEdits:{...edits,[target.id]:value}},changes}
}
