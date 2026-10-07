# 小游戏工坊运行与交付

## 当前交付

已发布：https://game-forge-yu-demo.zhuanglaihong.chatgpt.site （公开访问，无需登录）。2026-10-07发布，Sites部署状态已确认succeeded。

公开Demo：网址在本文件的发布记录中。无需登录，可试玩「羊了个羊」「向僵尸开炮」「武侠大乱斗」（同名玩法演示，原创素材，非官方游戏）；支持左侧对话调整速度、难度、颜色、游戏名与武将，右侧立即重新试玩。本机保存可跨刷新恢复，分享链接携带作品参数，朋友打开直接玩；下载源码可选择JavaScript工程、TypeScript/Vite工程或单文件HTML。

按用户选择，此次Demo没有连接公网AI后端：对话调整是明确的模板参数解析，不是远端模型调用，也不能生成任意新玩法。四个样例由本次AI编码制作。默认先展示完整成品；点击「观看制作回放」才展示专业预设需求与执行记录的流式回放、逐阶段预览及试玩解锁，支持暂停、重播、跳过；回放不是实时模型生成。后续任意创意生成使用原Java AI服务，不能把Demo的模板功能当作自由生成已上线。

新增「星际防线」原创科幻数字门射击；武侠采用连续开放地图、跟随镜头、四面来敌及乔峰掌法预警。Demo和正式创作台共用品牌栏、面板配色与布局主题，具体边界见[玩法参考说明](docs/GAME_REFERENCES.md)。

## 正式平台

保留原项目的用户账户、SSE流式生成、AI记忆、数据库作品记录、HTML/多文件/Vue代码保存、源码下载与发布。首页新增公开样例入口，正式创作仍通过原/app/add与/app/chat/gen/code接口。代码生成完成后自动保存，用户之后进入「我的小游戏」继续修改。

后端已新增匿名/published/{deployKey}/入口，直接读取tmp/code_deploy，不再必须额外配置Nginx/dist目录。预览仍走/static/{codeType}_{id}/。资源入口校验目录边界和符号链接，支持JS/CSS/SVG/GLB/JSON/WASM等游戏文件。

生产部署时配置：code.deploy-host=https://你的后端域名/api/published；前端VITE_API_BASE_URL指向后端API；VITE_DEPLOY_DOMAIN指向同一个公开游戏根地址。默认前端通过/api代理，已发布游戏路径为/api/published/{key}/。公开域名必须是外网可访问的HTTPS，localhost地址只能用于本机。

安装JDK21并配置MySQL、Redis、模型密钥后启动原Spring Boot服务。模型密钥只放后端配置，不放Demo、浏览器或公开源码。微服务版本已同步资源入口、提示词与保存/构建失败处理。

## 本地运行

1. 前端目录：npm ci。
2. 前端目录：npm run dev；访问http://127.0.0.1:5173/demo（端口被占用时按终端提示）。
3. 正式平台首页：访问http://127.0.0.1:5173/，需要原后端。
4. 前端目录：npm run test:demo验证核心玩法；npm run build检查正式版；npm run build:demo生成独立Demo。
5. 根目录：node scripts/prepare-game-demo.mjs，将构建结果和必要源码快照准备到demo-site；Sites发布身份保存在demo-site/.openai/hosting.json，勿重建同一个站点。

Windows发布工具须把已安装的Git/bin加入本次进程PATH，以便调用Git Bash。打包目录使用dist；交给GNU tar的归档路径使用/d/project/...格式，避免D:被识别为远端主机。Sites上传归档时使用对应的Windows绝对路径。

## 验证记录

- 正式前端TypeScript检查与生产构建通过。
- Demo TypeScript检查与独立构建通过，JS压缩约75KB。
- 测试通过：12个随机叠层牌局有可通关路径；三消撤回/重开；数字门不重复结算；暂停冻结；升级强化生效；失焦暂停；中文分享参数还原与错误数据拒绝。
- 浏览器验证：开始后战斗计时与击败数变化；对话降低速度和改颜色；保存后刷新恢复；分享在独立页面打开并进入试玩界面。
- 当前机器没有JDK，Java后端修改未编译或联调。公网AI后端未部署，正式生成与账户作品保存仍需后端环境验证。

## 范围

轻量2D、2.5D和简单3D网页游戏；不承诺3A品质、实时多人联网或完整商业游戏系统。Demo的分享是不可变参数快照，不是云端账号作品库；本机作品不会自动同步到其他设备。

## 素材库与本次玩法更新

素材库展示真实图片模型生成的 PNG 图集，共农场、末日、武侠三个区域，支持提示词预览、原图下载和对应封面应用。不会把预生成图冒充实时外接 API。设计文档见 [docs/ART_ASSETS.md](docs/ART_ASSETS.md)。

三款游戏提供关卡／难度1—3，通关提示进入下一关。守城下方展示已获得强化词条。武侠大乱斗使用环绕飞刀接触伤害，无发射子弹；敌人掉落经验、靠近吸附拾取，满经验升级选择数量、品质或生命。重开清空经验、飞刀强化与掉落物。

下载HTML内嵌运行时和封面图片；下载源码ZIP保留index.html、runtime.js、game.json、assets.json及引用素材。分享域名是当前托管服务地址，链接复用运行时并携带参数，不代表单独部署。

## 2.5D和源码格式更新

武侠默认斜视2.5D，保留2D绘制并提供对话切换示例。下载入口改为「下载源码 + 格式下拉框」，支持Web JS工程、TS入口/JS运行时Vite工程和单文件HTML，Godot、Unity待适配。目录和运行方式见 [docs/GAME_SOURCE_FORMATS.md](docs/GAME_SOURCE_FORMATS.md)。导出的Vite工程已经独立通过类型检查与生产构建。

## 2026-10-07 开放江湖更新

公开版本5部署成功：开放地图、四向来敌、乔峰范围掌法、原创科幻小队案例、默认成品试玩及共用创作台主题。源码提交：44ca52028cf79fb21b06a4dd8177ae401a365e98。部署ID：appgdep_6ac612c8ff008191be75ebce71c91b58。


## 本次3D射击与回放修复

「向僵尸开炮·远征」替换旧炮塔；首页保持三个案例，移除独立「星际防线」入口。新增9个公开CC0的GLB、Three.js战场、技能与完整素材导出。左侧「演示生成」恢复流式制作入口，区别于对话参数修改。转刀增加自动补刀与伤害数字，仍保留2.5D选项。具体状态见docs/PUBLIC_GAME_ASSETS.md。

## 2026-10-07 第6版公开发布
- 状态：succeeded；地址：https://game-forge-yu-demo.zhuanglaihong.chatgpt.site
- Site源码提交：9ff881a909c39e701fbed70bbec448ed9b55c67e
- 版本：appgprj_6ac5f1b49f748191b088ff22f4a5dfab~appgver_79269c7b806c8191a3b0168ad71440e1
- 部署：appgdep_6ac61b11fddc8191a721750c8b0817e5
- 射击案例替换为真实Three.js/CC0 GLB远征战场；恢复左侧制作流式回放；转刀加入定时补刀与快节奏碰撞。保留三个案例。
- 验证：test:demo、build:demo、build通过；导出Vite/TS工程通过tsc与构建；浏览器实际下载JS源码包含9模型与许可证，实际试玩验证升级/增援/暂停/难度2。
