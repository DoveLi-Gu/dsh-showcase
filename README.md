# dsh-showcase

[![CI](https://github.com/DoveLi-Gu/dsh-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/DoveLi-Gu/dsh-showcase/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-111115.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-2f855a.svg)](https://nodejs.org/)

面向编程 Agent 工作流的**本地优先、可核验交付证据工具**。它把 Git 改动、测试回执、脱敏结果、响应式截图和交付状态整理成 Markdown 摘要与自包含 HTML 海报，方便复核、展示和归档。

> 本项目是社区工具，不是 DeepSeek、DSH 或《终末地》的官方产品，也不代表任何官方背书。演示素材的授权边界见 [CHARACTER_ASSET_NOTICE.md](CHARACTER_ASSET_NOTICE.md)。

## 预览

<details open>
<summary>终末地帝江号主题</summary>

<p><strong>桌面 1K 预览（1024 × 640）</strong></p>
<p><a href="docs/assets/dijiang-desktop-latest.png"><img src="docs/assets/dijiang-desktop-latest.png" alt="终末地帝江号主题桌面 1K 预览" width="680"></a></p>

<p><strong>移动端 1K 预览（455 × 1024）</strong></p>
<p><a href="docs/assets/dijiang-mobile-latest.png"><img src="docs/assets/dijiang-mobile-latest.png" alt="终末地帝江号主题移动端 1K 预览" width="220"></a></p>
</details>

<details>
<summary>蓝色大肥鱼主题</summary>

<p><strong>桌面 1K 预览（1024 × 640）</strong></p>
<p><a href="docs/assets/blue-big-fish-desktop-latest.png"><img src="docs/assets/blue-big-fish-desktop-latest.png" alt="蓝色大肥鱼主题桌面 1K 预览" width="680"></a></p>

<p><strong>移动端 1K 预览（455 × 1024）</strong></p>
<p><a href="docs/assets/blue-big-fish-mobile-latest.png"><img src="docs/assets/blue-big-fish-mobile-latest.png" alt="蓝色大肥鱼主题移动端 1K 预览" width="220"></a></p>
</details>

## 能做什么

- **跨项目使用**：适用于前端、后端、CLI、库、Python、静态 HTML 等项目，不把数据写死在本仓库。
- **交付证据**：记录项目名、任务目标、Git 状态、测试命令、退出码、耗时、脱敏统计和截图状态。
- **两套视觉主题**：终末地帝江号、蓝色大肥鱼；主题只在 DSH 插件设置中选择，报告页面不提供切换按钮。
- **本地优先**：插件只读取当前项目并在当前项目的 `.showcase/` 目录写入产物，不上传文件。
- **边界可解释**：没有 Git、没有测试、空产物、跨主题截图、截图不可读或报告过期时，输出 `partial`/`failed` 和明确复核提示，不伪装成成功。
- **自包含产物**：生成的 Markdown 和 HTML 海报可以脱离开发服务器单独打开。

## 安装

### 在 DSH 中使用本地仓库

```powershell
git clone https://github.com/DoveLi-Gu/dsh-showcase.git
Set-Location .\dsh-showcase
npm ci
npm run check
dsh plugin --profile web add .
```

重启 DSH，并新建一个会话，让插件工具完成加载。然后在插件设置中选择主题和是否生成 HTML 海报。

### 发布到 npm 后

本仓库已配置公开包元数据、Node.js 版本约束和 `prepublishOnly` 校验。正式发布后，可按 DSH 当前版本支持的插件安装方式使用包名 `dsh-showcase`；本地开发时仍推荐使用上面的路径安装方式。

## 在任意项目中生成证据

CLI 目前随源码仓库提供，适合在目标项目目录中生成 `.showcase/report.json`：

```powershell
Set-Location C:\work\your-project
$showcaseRepo = "C:\tools\dsh-showcase"
& "$showcaseRepo\node_modules\.bin\tsx.cmd" "$showcaseRepo\src\cli\index.ts" init
& "$showcaseRepo\node_modules\.bin\tsx.cmd" "$showcaseRepo\src\cli\index.ts" capture
```

如果你已经在本仓库目录开发，也可以直接运行：

```bash
npm run init
npm run capture
```

之后调用 DSH 工具 `showcase_layout_summary`：

```json
{
  "projectPath": ".",
  "reportPath": ".showcase/report.json",
  "outputPath": ".showcase/layout-summary.md",
  "posterPath": ".showcase/layout-poster.html",
  "generatePoster": true,
  "locale": "zh-CN"
}
```

只有 `projectPath` 必填。插件会自动寻找常见的 React、Node、Python 和静态 HTML 源文件；项目结构特殊时，可以传入项目相对的 `appPath` 或 `cssPath`。`generatePoster` 只覆盖本次调用，不会偷偷修改持久设置。

### 生成时机

| 场景 | 建议 |
| --- | --- |
| 普通编辑、状态查询、局部调试 | 不生成交付产物 |
| 测试完成，需要文字回执 | 生成 Markdown 摘要 |
| 视觉审核、展示或最终交付 | 生成 Markdown + HTML 海报 |
| 测试失败或证据不完整 | 保留 `failed`/`partial` 产物，先复核再交付 |

## 安全与边界

- 报告最大 2 MiB；单个源码文件最大 2 MiB；单张截图最大 8 MiB、尺寸不超过 16384 px。
- 每张海报最多嵌入 3 张已校验、与当前主题匹配的截图。
- 常见 Token、Authorization 值、GitHub Token 格式和本机绝对路径会在写入报告前尝试脱敏。
- `.showcase/`、`dist/`、`node_modules/`、临时日志和本机工具目录默认不应提交到 GitHub。
- 脱敏是降低风险的措施，不是绝对保证。公开报告前仍应人工检查任务文本、测试输出、截图和自定义路径。
- 终末地帝江号和蓝色大肥鱼是视觉主题名；项目不包含官方品牌承诺或官方素材授权。

## 开发

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run pack:check
```

一次执行全部发布前检查：

```bash
npm run check
```

项目结构：

```text
src/                  CLI、报告 schema、Git/命令/脱敏逻辑
plugin/               DSH 插件、设置面板、摘要和海报生成器
tests/                单元、跨项目、极端输入和产物测试
docs/                 上传指南、发布说明和 README 截图
.github/workflows/    Node 20/22 CI
```

## 维护与发布

- 日常维护流程见 [贡献指南](CONTRIBUTING.md)。
- 公开仓库前的凭据、素材和 npm 检查见 [发布检查清单](docs/RELEASE_CHECKLIST_ZH.md)。
- GitHub 首次上传和后续推送见 [GitHub 上传与维护指南](docs/GITHUB_UPLOAD_GUIDE_ZH.md)。
- 安全问题请按 [SECURITY.md](SECURITY.md) 的方式报告，不要在公开 Issue 中粘贴密钥或私密报告。

## 隐私

默认情况下，报告和海报只写入目标项目的 `.showcase/`。本插件没有远程上传步骤，也不会把项目文件发送到本仓库。分享前请审查最终产物。

## 许可证

源代码和普通仓库文件使用 MIT，详见 [LICENSE](LICENSE)。演示角色、照片和由其衍生的截图不自动包含在 MIT 授权中，详见 [CHARACTER_ASSET_NOTICE.md](CHARACTER_ASSET_NOTICE.md)。
