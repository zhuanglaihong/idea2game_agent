# 公开游戏素材导入与3D案例

## 当前已接入

公开 Demo 的射击案例现在是「向僵尸开炮」，替代旧炮塔案例；没有新增独立的「星际防线」案例。使用 Three.js/WebGL、透视相机、阴影、金属桥面、双路线增援、装甲小队、三种编成、空袭/增援/鼓舞及终局首领。WebGL不可用时保留Canvas兼容运行。

已从 [Kenney Space Kit](https://kenney.nl/assets/space-kit) 官方下载9个CC0的GLB文件。公开页面与随包 `License.txt` 都允许个人、教育及商业项目使用。下载地址来自官方页面，而非临时镜像。

```powershell
node scripts/import-public-assets.mjs
cd yu-ai-code-mother-frontend
npm run build:demo
```

导入器使用已核实的官方资源包；不是任意URL下载器。当前是项目开发工具，尚未做成任意用户在网页贴URL即可导入的功能。

## 目录与资源记录

- `public/demo-games/space-kit/*.glb`：模型原文件，用于实际战场。
- `public/demo-games/space-kit/*.png`：同包预览图，用于军令简报与公开素材库。
- `public/demo-games/space-kit/manifest.json`：来源、CC0许可、格式、大小与SHA256。
- `public/demo-games/space-kit/LICENSE.txt`、`THREE-LICENSE.txt`：素材CC0与Three.js MIT许可。
- `src/demo/expeditionRenderer.js`：未压缩的3D渲染源码；构建脚本生成可离线导出的渲染器。

游戏在隔离iframe中执行。父页面读取项目本地GLB，再以数据URI传入，避免沙箱的跨源读取问题；未放宽iframe的同源权限。

## 下载源码

JS和TS/Vite工程均包含模型、图片、渲染器、未压缩渲染源码及许可证。单文件HTML内嵌模型与图片；公开分享链接从已发布项目读取相同资源，不向原素材站热链。更换素材时应同步检查模型尺寸、朝向、动画与性能。

素材库现同时展示AI预生成图片与公开下载的GLB。专业图片/视频模型API仍待接入；公开素材导入不代表外接模型API已实现。

## 参考站的具体差别

[StarCraft: Ashfall](https://starcraft-shooter-2026.pages.dev/) 使用成熟的兵种系统和带动画模型。其[素材说明](https://starcraft-shooter-2026.pages.dev/assets/credits)写明多个模型、字体、图标、音频来自暴雪原作或社区作品，并说明模型只展示、不提供下载，公共镜像不构成独立授权。已查看的公开入口没有给出可复用的源码仓库许可。

本次学习的是作战简报、深色金属界面、3D长桥、编队、增援选择和技能HUD；没有把原站复制改名，也没有导入其原版星际素材。CC0模型仍是低多边形风格，精细度与原站模型不同，不能宣称完全复刻其成品。

## 转刀与回放

用户确认先按火山哥哥原版方向调整：现有飞刀每5秒自动补充一把，最多9把，提升旋转速度、加入伤害数字；保留经验升级、开放地图、2D/2.5D切换和乔峰Boss。这是浏览器同类玩法实现，尚不是原作代码或原作人物贴图复刻。

左侧增加「制作演示 / 对话修改」两个明确入口。制作演示的提交按钮启动预录流式执行；对话修改解析当前可调参数。回放的暂停、继续、跳过、切换取消、卸载清理均有自动测试，回放不被描述成实时模型调用。

## 素材检索核实（2026-10-07）
- 当前射击案例名称恢复为《向僵尸开炮》，去除“远征”后缀。
- 前次检索关键词：鸠摩智转刀、火山哥哥、转刀开源、Vampire Survivors Canvas、Kenney Space Kit。找到的是游戏介绍、玩法评测、同类代码和CC0模型，并未找到鸠摩智原版美术包，也未核实原版逐项素材出处。
- 用户提供的“转刀大佬”图片是美术参考：卡通武侠角色、金色弯刀环、高饱和场景和发光效果。单张宣传图不能代替透明角色、独立武器、动作帧、地图和特效素材。
- 2025版《火山的转刀大乱斗》与2023版《鸠摩智转刀》是不同作品。作者页 https://www.bilibili.com/list/137429365?bvid=BV1BKU5BxEza&oid=115586831096556 提供成品游戏下载，不能据此断言原版素材来源或取得素材源文件。
- 现有Kenney Space Kit是低多边形静态模型；与参考站角色、材质和动画不同。浏览器/Three.js支持更高精细度，当前差距来自具体素材与场景、动画、特效实现，不是HTML格式或本地存储限制。实现视觉相似需要一套风格统一的角色、动作、场景、UI和特效，不能仅增加模型数量。

## 第8版实际素材变化
- 羊了个羊使用farm-atlas.png六图标透明图集（草、蘑菇、向日葵、草莓、蝴蝶、月亮），由内置image_gen生成，直接在Canvas按3×2单元采样，不是原版素材。提示词：production-ready 3 columns by 2 rows farm triple-match sprite atlas; six centered transparent objects; warm cartoon mobile-game illustration; strong outlines; saturated colors; readable at 44px; no text, frames or extra objects。
- 射击导入reference/art/terran-deck.webp、reference/ui/marine.webp、reference/fx/droppod-scorch.png，分别用于桥面、头像和击败反馈；来自参考站Ji作者的AI美术，不能统称为暴雪原版或CC0。reference/manifest.json记录来源/哈希，SOURCES.txt随包保留。StarCraft相关IP归暴雪，参考站美术与社区作者权利另列；署名不是独立授权。
- 原版marine-sc2.glb已按页面映射路径和带版本号路径尝试读取，两次404；本次没有拿到暴雪动画模型，战斗单位仍是Kenney。不宣称完整复制或相同画面。
- 原文“没有导入参考站素材”描述的是第6版以前状态，上述记录为当前状态。
