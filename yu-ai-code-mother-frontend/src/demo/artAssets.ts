/** Demo 素材图集：3 个区域共用一张真实生成的 PNG，未连接用户侧生成 API。 */
export const artAssets = [
 {id:'farm-cover-v1',kind:'tiles',name:'阳光农场 · 绵羊',use:'农场游戏封面',position:'0%',region:'左 1/3',source:'图片生成模型 · 本次预生成',path:'art-showcase.png',version:1,prompt:'原创手机游戏插画：圆润白色绵羊，阳光农场、胡萝卜、花丛、风车，奶油色与薄荷绿，细腻卡通美术，无文字、水印。'},
 {id:'zombie-cover-v1',kind:'zombies',name:'末日防线 · 炮塔',use:'守城游戏封面',position:'50%',region:'中 1/3',source:'图片生成模型 · 本次预生成',path:'art-showcase.png',version:1,prompt:'原创末日守城插画：绿色卡通僵尸、厚重炮塔、破损公路，灰绿与警戒黄，明确角色轮廓，无血腥、文字、水印。'},
 {id:'wuxia-cover-v1',kind:'history',name:'竹庭飞刃 · 青衣侠客',use:'武侠游戏封面',position:'100%',region:'右 1/3',source:'图片生成模型 · 本次预生成',path:'art-showcase.png',version:1,prompt:'原创中国武侠插画：青衣侠客、长发、银色飞刀环绕，竹林庭院与远山，水墨结合精致2D游戏美术，无文字、水印。'},
] as const
