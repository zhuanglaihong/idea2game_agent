# 游戏引擎、构建与托管

## 当前能力（2026-10-07）

Demo仍为三个游戏。当前运行的是Canvas与Three.js，Phaser、Godot、Unity、Ruffle被列为目标引擎；选择目标不会把当前试玩偷偷替换为另一个引擎。Unity转刀提供独立C#基础原型源码，尚未编译验证，也未移植全部Web玩法和美术。Phaser/Godot/Ruffle尚未接入生成和编译。

现有Java平台的代码生成路由为HTML、多文件、Vue，构建器调用npm；尚无Unity/Godot执行器，也没有网页访问用户电脑程序的桥接服务。Codex在开发机写C#不等于平台已能调用本地Unity。

## 接入方式

1. AI输出对应工程：Web的JS/TS；Unity的C#、Assets、Packages、ProjectSettings；Godot的project.godot、GDScript、场景。
2. 本地执行器或服务端构建机安装引擎，限定工程目录、固定构建方法，执行构建并流式返回日志。
3. 构建失败后AI读取日志修复；不能只根据有源码文件就宣布成功。
4. Web产物在隔离iframe中试玩，验证输入、素材加载、性能与移动端。
5. 下载源工程，发布Web产物，提供分享链接。不同引擎不是同一份代码更换文件后缀。

本地执行器应采用用户明确连接的代理；公网网站不能直接启动Unity.exe。Unity需Editor、有效许可证与Web Build Support；命令行支持batchmode、projectPath、executeMethod。源码原型内已提供build.ps1与GameBuild.Web，打开Editor也能通过菜单构建。没有Editor时，不生成假的WASM构建。

## 选型

| 目标 | 工具 | 当前状态 |
| --- | --- | --- |
| 网页UI + 轻量2D/2.5D | Canvas / Vue | 三个Demo可玩 |
| 浏览器3D | Three.js | 射击案例可玩 |
| 专业2D网页游戏 | Phaser | 目标方案，待适配 |
| 2D/3D开源编辑器 | Godot | 目标方案，待适配 |
| C#编辑器工程 | Unity | 转刀基础原型可下载，待Editor验收 |
| 已有Flash SWF | Ruffle | 兼容方向，待接入和逐作验证 |

Flash Player已结束支持，新作采用HTML5/WebGL/WebAssembly。Ruffle是兼容旧SWF的模拟器，不是自动把JS转成Flash的工具。

## 安装空间

Unity版本、平台模块、Visual Studio、下载缓存及Library缓存影响体积，不能给出固定下载量。建议仅Editor+Web模块按20–30GB安装预算、至少50GB空余空间预留（规划估算，不是官方统一下载数字）。以Hub选择模块后的显示为准。Godot通常更轻，但需要匹配导出模板；此工作未安装任何引擎。

## Cloudflare发布

Web游戏可将完整构建目录上传Cloudflare。Unity发布Build/Web的loader.js、framework.js、wasm、data与HTML，Godot发布其Web导出目录。C#和GDScript源码本身不能在静态网站直接运行。Cloudflare Pages单文件限制为25MiB；大型引擎构建必须检查体积，必要时调整构建或采用适合的资源托管。压缩产物需匹配响应头，不应只上传index.html。

当前公开Demo仍使用原托管服务；Cloudflare手动部署路径已在UI说明，账号授权与自动部署API未接入。不会将现有域名伪装成pages.dev。

官方文档：
- https://docs.unity3d.com/Manual/EditorCommandLineArguments.html
- https://docs.unity3d.com/Manual/webgl-building.html
- https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- https://docs.phaser.io/
- https://ruffle.rs/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/platform/limits/
