export interface ReplayStep { title: string; type: 'analysis' | 'tool' | 'result'; file: string; text: string }
export const replayStages = ['需求分析', '界面骨架', '游戏美术', '玩法与交互', '交付试玩']
export const replayScripts = {
 tiles: [
  {title:'方案分析',type:'analysis',file:'design/requirements',text:'设计摘要：采用叠层三消规则，七格槽形成策略压力。每层以三张为一组生成卡牌，保留合法消除路径；上层遮挡下层，只允许选择可见牌。视觉采用浅绿草地、米白卡牌、粗描边农场插画。桌面与手机统一点击操作。'},
  {title:'建立游戏界面',type:'tool',file:'index.html · layout.css',text:'制作步骤 · write_file\n建立顶部关卡栏、主牌堆、七格暂存槽、撤回与重开按钮。布局以480px逻辑画布适配手机，暂存槽与操作区保持可见。右侧现已呈现界面骨架。'},
  {title:'绘制农场美术',type:'tool',file:'art/farm-icons · scene',text:'制作步骤 · render_assets\n素材库提供图片模型生成的农场封面，游戏内图案仍由Canvas绘制。绘制羊、胡萝卜、玉米、草垛、水桶与花朵图案，卡牌使用投影和立体底边。补充草地花丛、远山和绵羊装饰；被遮挡卡牌降低亮度，让可操作状态一眼可见。'},
  {title:'实现消除规则',type:'tool',file:'rules/tiles · input',text:'制作步骤 · write_file\n接入点击命中、遮挡判断、三张消除、空槽释放与七格失败条件。保存每一步状态用于撤回；暂停后禁止选择，重开清空槽与操作历史。右侧已经出现完整牌堆与交互。'},
  {title:'游戏就绪',type:'result',file:'preview/index.html',text:'交付摘要：界面、农场素材和消除规则已完成。可试玩开始、三张配对、撤回、暂停和重开；右侧已解锁游戏。点击「开始游戏」，也可以继续对话调整难度，再保存或分享自己的版本。'},
 ],
 zombies: [
  {title:'设计作战方案',type:'analysis',file:'design/requirements',text:'设计摘要：用3D斜视桥面、小队编成与数字门增援替换旧炮塔案例。角色自动瞄准，玩家负责左右选择路线。加入60秒战斗、三选一强化、尸潮首领和空袭技能；界面采用作战简报、兵力HUD与金属控制台。'},
  {title:'建立远征界面',type:'tool',file:'index.html · briefing.css',text:'制作步骤 · write_file\n建立军令简报、标准/重装/突击三种小队、关卡和兵力栏；建立空袭、增援、鼓舞按钮及暂停、重开、战报区域。'},
  {title:'下载并接入公开素材',type:'tool',file:'assets/space-kit/manifest.json',text:'制作步骤 · import_public_assets\n从Kenney Space Kit公开CC0素材包下载9个GLB模型，保存到本地项目；记录原始来源、文件大小、SHA256和许可证。Three.js载入装甲步兵、异变敌人与战车，用于实际战场，公开素材库提供模型下载。'},
  {title:'接入3D战斗与技能',type:'tool',file:'src/game/runtime.js · expedition-renderer.js',text:'制作步骤 · write_file\n接入透视相机、阴影、钢板地面和灯带；自动射击、数字门兵力变化、击败升级与首领挑战使用真实规则。空袭造成范围伤害，增援补充兵力，鼓舞提高8秒攻击，技能有冷却。'},
  {title:'远征成品交付',type:'result',file:'preview/index.html',text:'交付摘要：右侧可以部署小队试玩，源码包包含渲染器、模型和许可证。可以调整兵力和难度，使用空袭、增援与鼓舞迎战尸潮首领。'},
 ],
 gates: [
  {title:'玩法方案',type:'analysis',file:'design/requirements',text:'设计摘要：原创科幻数字门射击。左右移动选择增援路线，兵力变化同步影响射击火力，目标是在60秒后击败机械首领。'},
  {title:'建立界面',type:'tool',file:'index.html',text:'制作步骤 · 创建兵力、关卡、击败数量信息栏和可操作画布。'},
  {title:'绘制星港',type:'tool',file:'src/game/runtime.js',text:'制作步骤 · 绘制深色金属地板、能量灯带、装甲小队与异星机械，使用原创Canvas美术。'},
  {title:'接入战斗',type:'tool',file:'src/game/runtime.js',text:'制作步骤 · 接入自动射击、双路线数字门、兵力结算、强化选择与首领挑战。'},
  {title:'成品就绪',type:'result',file:'preview/index.html',text:'可以直接试玩、调整难度、保存、分享与下载源码。选择增援路线，壮大小队并击败机械首领。'},
 ],
 history: [
  {title:'方案分析',type:'analysis',file:'design/requirements',text:'设计摘要：武侠大乱斗采用2.5D斜视战场与环绕飞刀生存玩法。飞刀围绕角色旋转，碰到敌人造成伤害。敌人掉落经验宝石，靠近拾取；经验满升级，选择飞刀数量、品质或回复生命。场景使用连续草地、竹林、跟随镜头、深度排序和角色投影，碰撞保持二维世界坐标，触摸坐标反向投影。对话输入「改成2D俯视版本」可切回原版。美术使用开放江湖、红袍鸠摩智与飞刀轮廓，敌人从四周生成，60秒迎战乔峰。'},
  {title:'建立江湖界面',type:'tool',file:'index.html · layout.css',text:'制作步骤 · write_file\n建立生命、关卡、角色等级和经验栏，预留飞刀属性区与升级弹窗。支持方向键、WASD与触摸拖动。'},
  {title:'准备武侠美术',type:'tool',file:'assets/art-showcase.png · canvas',text:'制作步骤 · import_asset\n素材库内已准备图片模型生成的武侠封面，游戏内使用独立Canvas角色绘制。以稳定项目文件路径引用封面，不依赖模型临时链接；展示来源、用途与提示词。'},
  {title:'实现飞刀与经验',type:'tool',file:'rules/orbit · experience · upgrades',text:'制作步骤 · write_file\n接入环绕位置计算、每5秒补充一把飞刀（最多9把）、接触伤害冷却、敌人掉落经验与吸附拾取。经验满暂停升级，选择数量后增加环绕飞刀，选择品质后提高伤害；击败首领解锁下一关。'},
  {title:'江湖就绪',type:'result',file:'preview/index.html',text:'交付摘要：武侠大乱斗已就绪。移动角色，让飞刀接触敌人，再拾取经验升级。可调整难度、保存作品，下载独立游戏或包含代码与图片的源码包。'},
 ],
} satisfies Record<string, ReplayStep[]>
