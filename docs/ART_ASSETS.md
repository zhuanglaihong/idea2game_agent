# 外接美术模型 + 项目素材库

## 功能定位与交付状态

通用 LLM 负责玩法、代码、布局与素材需求；图片模型负责绘制。平台接收结果并保存为项目文件，预览、源码导出与发布使用同一份素材，不要求玩家连接模型服务。

已交付的公开 Demo：真实图片模型预生成的农场、守城、武侠封面图集；素材预览、提示词说明、原图下载、对应游戏封面应用；随作品保存封面开关，分享链接还原；HTML 内嵌图片和 ZIP 源码附带图片。农场与武侠实体使用Canvas；射击案例已使用Three.js/GLB。新增9个Kenney CC0公开模型、预览图、来源/哈希清单及许可证，已用于战场并包含在源码导出中。导入命令和范围见[公开素材说明](PUBLIC_GAME_ASSETS.md)。素材是同一张 PNG 的三个展示区域，不是三个独立精灵图。

尚未交付：用户选择外接模型后实时生成、用户上传、后台任务持久化、素材版本替换与回滚、图片规范化、视频生成。这些是下一阶段的功能开发，Demo 的预生成图不表示厂商 API 已接通。

## 模型适配

以 `ImageProvider` 适配器统一厂商差异：`submit(request)` 返回任务 ID，`status(taskId)` 返回统一状态与结果，`cancel(taskId)` 按厂商能力支持。同步厂商由适配器转换为已完成任务。接口能力描述包括透明背景、参考图、尺寸范围及计费信息，不支持的能力应明确提示。

请求字段：`projectId`、`assetId`、`providerId`、`modelId`、`prompt`、`negativePrompt`（可选）、`referenceAssetIds`、`width`、`height`、`transparent`、`idempotencyKey`。平台的代码模型只产生素材需求，不替用户配置厂商密钥。

任务状态：`queued → running → importing → succeeded`，以及 `failed / cancelled`。生成完成之后下载、校验、保存成功才进入 succeeded；记录厂商任务 ID、错误、实际模型、费用（未知则标为未知）与重试次数。幂等键避免重复点击产生重复计费。

建议的后端接口（设计契约，尚未实现）：

| 接口 | 用途 |
| --- | --- |
| `GET /api/art/providers` | 列出已配置模型与能力 |
| `POST /api/projects/{id}/art/jobs`、`GET .../jobs/{jobId}` | 创建与查询素材任务 |
| `POST /api/projects/{id}/assets/upload` | 上传素材 |
| `GET /api/projects/{id}/assets` | 项目素材列表与版本 |
| `POST /api/projects/{id}/assets/{assetId}/apply` | 应用指定版本到逻辑素材槽 |

即梦等专业模型作为候选提供方：接入时核实官方接口、费用与素材使用条件，不依赖网页抓取或非官方登录模拟。可自部署模型也遵循同一适配器，不承诺免费托管额度。视频使用独立 `VideoProvider`，后续定义时长、帧率、音轨等字段，不强行套用图片参数。

## 素材管理与兼容

素材记录包含 `assetId/projectId/version/type/role/providerId/modelId/prompt/referenceIds/filePath/mime/width/height/sha256/bytes/createdAt/licenseNote`。原始文件与规范化文件分别保存。类型包含 image、sprite_sheet、audio、video；角色包含 cover、background、character、icon。图集增加区域坐标、帧宽高、帧数与锚点。商业使用授权未知时保留来源信息，不自动声称已获得商用许可。

游戏引用逻辑槽如 `hero/main`，项目清单解析为 `assets/hero-v2.png`。生成新版本先预览，再应用；旧版本保留可回滚。发布冻结清单和引用版本，重新绘图不会意外修改别人正在玩的已发布版本。

后台保存到 `projects/{projectId}/assets/{assetId}/{version}/` 或对象存储；数据库存索引。不要长期引用厂商临时 URL。下载只允许适配器提供的已校验 HTTPS 来源，阻止私网地址、重定向绕过、过大文件与伪造 MIME；检查真实文件头。密钥仅放后端，接口检查作品归属。

图片适配需检查实际透明通道、尺寸、裁切、锚点、精灵图布局及加载错误；缺少可用图片时显示已有绘制素材。图片模型无法代替游戏布局、交互和逻辑。Demo 的封面插画没有自动变成运行中的角色精灵，这是明确的素材用途区分。

## 导出与发布

独立 HTML 适合轻量 Demo：内嵌 JS 与封面图片，离线双击可玩。ZIP 源码包含 `index.html`、`runtime.js`、`game.json`、`assets.json`、已引用 PNG 与说明；适合继续修改或迁移托管。正式项目可导出 HTML/CSS/JS 多文件或 Vue 工程，不限定为单个 HTML。

分享 URL 的域名来自托管服务，当前为 `game-forge-yu-demo.zhuanglaihong.chatgpt.site`。Demo 链接携带作品参数，复用已托管运行时；不是为每个作品创建独立部署。正式一键部署应上传整个构建产物与素材，再返回作品地址；用户可使用自己的域名。

## 开发顺序

1. 实现项目素材表、存储与上传下载。
2. 接入一个正式图片适配器与可查询任务。
3. 增加素材生成预览、应用、版本回滚与费用确认。
4. 将同一份素材清单接入游戏预览、源码导出与发布。
5. 图片链路稳定后再扩展精灵图、音频与视频。
