# 玩法参考与科幻射击网页实现分析

检查日期：2026-10-07。首页入口为原创玩法原型的生成提示，不是已经预置完成的游戏，也不保证一次生成达到参考站点的成熟度。

## 近年玩法参考

- 叠层三消：羊了个羊官方入驻页标明2022-09-30上线，属于近几年流行案例，不称为2026年新游戏。https://www.taptap.cn/app/238441
- 数字门增长：Mob Control官方商店介绍明确说明射击倍率门、壮大队伍与移动门等元素，符合用户所述数字选择加强玩法；仅凭描述无法确认用户记忆中的具体游戏。https://apps.apple.com/us/app/mob-control/id1562817072
- 分路射击：Last War官方商店介绍包含分路障碍与僵尸战斗，完整商业产品还包含基地与联盟等系统。平台先生成核心闯关原型。https://apps.apple.com/us/app/last-war-survival/id6448786147
- 肉鸽守城：向僵尸开炮官方商店页自述射击Roguelike。https://apps.apple.com/cn/app/id6474293468
- 合成掉落与科幻虫潮作为补充玩法灵感，不将这五个入口宣称为最新热度排名。

## StarCraft: Ashfall 公开实现证据

参考站点：https://starcraft-shooter-2026.pages.dev/

读取的是公开HTML和部署后的JS，未获取作者源码仓库，也未实际操作完整游戏。

1. Vite打包：入口game-CitdKIpZ.js含__vite__mapDeps，并加载独立simulation、battle-ui、asset-url等模块。不能据此断定作者使用Vue或React。
2. Three.js/WebGL：RoomEnvironment-dWePrYr4.js包含THREE.WebGLRenderer、GLTFLoader与实例化渲染相关实现；HTML预加载多种.glb模型，包含桌面/手机不同版本。
3. 游戏系统：HTML有战地鼓舞、空袭、空投等技能按钮以及“左右移动/自动开火”提示；JS含独立战斗模拟、requestAnimationFrame、localStorage、Web Audio初始化。
4. 素材：页面引用模型、WebP图片、图标、字体与特效素材。漂亮画面依赖真实资产，不能靠业务页面提示词代替模型和动画资源。
5. 发布：pages.dev域名表明站点使用Cloudflare Pages；Cloudflare官方支持构建命令npm run build、输出dist。无法仅凭公开文件判断作者是否用AI、用了哪个模型、开发耗时或部署是否通过Git流水线。

部署资料：https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/

## 本平台的对应方式

用户描述 → 选择HTML或Vue工程 → 生成规则与状态 → 生成渲染/操作/素材 → 构建 → 试玩 → 对话调整 → 发布。

简单的数字门、叠层三消和守城可以由Canvas/DOM实现。涉及3D模型、物理库和复杂场景时使用Vue+Vite工程，按需安装Three.js、Phaser或Matter.js；Vue负责创作生成的界面，游戏引擎负责渲染与游戏更新。

本轮完成：首页五类入口、玩法规则约束、3D/物理库生成许可与路由、同步单体与微服务提示词。平台自身前端不需要安装Three.js，它应是生成出来的3D游戏的依赖。

后续要稳定达到参考站点效果，需要可复用的战斗/数字门/叠层消除基础模板、原创或可用的素材库与实际浏览器试玩验证。这些能力尚未实现，不能将提示词调整当成完成了游戏引擎建设。
