# dsh-showcase

[English README](README.md)

面向编程 Agent 工作的本地、可核验交付证据报告工具。

![蓝色大肥鱼主题桌面报告](docs/assets/blue-big-fish-desktop.png)

`dsh-showcase` 将本地项目证据整理为便于审查的产物：Git 改动、测试回执、脱敏结果、布局证据和可视化报告。它不要求账号，也不要求上传内容。

## 已实现能力

- 证据报告：收集任务元数据、Git 改动、测试回执和脱敏汇总。
- Git 证据：支持当前工作区改动或配置的基准引用。
- 测试回执：记录命令、耗时、退出码、状态和已脱敏输出。
- 脱敏：对常见 Token、Authorization 值、GitHub Token 格式和本机绝对路径进行处理。
- 两套独立构图的海报方向：**终末地帝江号** 与 **蓝色大肥鱼**。当前方向只在 DSH 插件设置中选择，报告页面内不再提供切换按钮。
- 支持 `prefers-reduced-motion` 的常驻氛围：终末地帝江号使用建筑漂移、机械遮罩和信号流；蓝色大肥鱼使用角色漂浮、漫画弧线和金色星标呼吸。
- CLI：初始化本地配置并采集报告。
- DSH 插件工具 `showcase_layout_summary`：生成本地 Markdown 布局摘要和自包含证据海报。
- 本地 Markdown 产物和自包含 HTML 海报。插件只读取项目文件、只在项目内写入，不上传内容。

![终末地帝江号主题桌面报告](docs/assets/field-signal-desktop.png)

![蓝色大肥鱼主题移动端报告](docs/assets/blue-big-fish-mobile.png)

![插件生成的蓝色大肥鱼自包含海报](docs/assets/plugin-blue-big-fish-poster.png)

## 快速开始

安装依赖后，在需要生成证据的项目中初始化并采集：

```bash
npm ci
npm run init
npm run capture
```

这里的 CLI 是源码仓库附带的开发辅助命令；当前发布到 npm 的包是 DSH 插件运行包，不包含 `src/cli`，也没有 `dsh-showcase` 的 `bin` 入口。通过 DSH 安装插件后，请在 DSH 工具中调用 `showcase_layout_summary`；只有克隆本仓库并安装完整依赖时，才运行上面的 `npm run init` / `npm run capture`。

`npm run init` 会创建 `.showcase/config.json`；如果识别到 Node、Python、Rust、Go 或 Maven 项目，会选择相应的默认测试命令。Node 项目只有在确实存在 `scripts.test` 时才会加入 `npm test`，重复执行 `init` 也不会覆盖已经定制的配置。你仍可在其中设置任务说明、可选 Git 基准引用、测试命令与超时时间。

`npm run capture` 会先写入 `.showcase/report.json` 再返回：检查全部通过时为 `completed`；没有测试或没有 Git 证据时为 `partial`；测试失败或超时时为 `failed`。`failed` 报告会保留供复核，同时 CLI 以退出码 `1` 结束；`completed` 和 `partial` 的退出码均为 `0`。

配置示例：

```json
{
  "task": "Capture verifiable delivery evidence.",
  "baseRef": "main",
  "tests": [
    "npm test",
    { "command": "npm run typecheck", "timeoutMs": 120000 }
  ],
  "timeoutMs": 120000
}
```

## DSH 插件

不会用 GitHub 时，可以直接照着 [GitHub 上传指南](docs/GITHUB_UPLOAD_GUIDE_ZH.md) 操作；它按本仓库当前的 `main` 分支和无远程仓库状态编写。

在本仓库目录中，为 web profile 添加插件：

```bash
dsh plugin --profile web add .
```

重启 DSH 后，必须新建一个会话，工具才会出现；已有会话不会加载新加入的插件工具。

在 **设置 → 插件 → 插件配置 → 布局证据产物** 中选择唯一的 **海报风格**：`终末地帝江号` 或 `蓝色大肥鱼`，并决定是否生成自包含 HTML 海报。选项保存在 DSH 的用户设置中。

### 生成时机与产物

`npm run capture` 和 `showcase_layout_summary` 是两个独立步骤。先让 `.showcase/report.json` 表示当前要复核或交付的检查点：UI 项目应完成代码修改、测试和响应式截图，非视觉项目完成相关测试即可。报告可以是 `completed`、`partial` 或 `failed`；后两种会生成明确的复核摘要，而不会伪装成成功。插件不是文件监听器，不会在每次编辑时自动重新生成。

建议的调用时机：

| 场景 | 是否调用 | 海报策略 |
| --- | --- | --- |
| 普通代码编辑、状态查询、局部调试 | 不调用 | 不产生交付产物 |
| 测试和截图完成，需要文字回执 | 调用一次 | 使用默认 Markdown-only |
| 后端/CLI 项目没有界面截图，或失败结果需要复核 | 调用一次 | 生成 Markdown；按需开启海报 |
| 用户要求视觉审核、展示或最终交付 | 调用一次 | 打开设置，或本次传 `generatePoster: true` |

默认情况下，一次调用只在项目内写入轻量产物：

- `.showcase/layout-summary.md`：始终生成的 Markdown 摘要。
- `.showcase/layout-poster.html`：可选的、按上方设置风格生成的自包含视觉海报。

“生成自包含 HTML 海报”开关是持久设置：关闭时每次只生成 Markdown；打开后后续调用会同时生成 HTML 海报。关闭开关不会删除已经存在的旧海报，只是不再新建或覆盖。工具参数 `generatePoster` 可以只覆盖本次调用：用户明确要看海报时传 `true`，只要 Markdown 时传 `false`；这个参数不会修改已保存的设置。插件不会同时生成两种主题，也不会因为自然语言请求悄悄切换主题。

为了避免误覆盖源码或配置文件，`outputPath` 必须位于项目的 `.showcase/` 目录并使用 `.md`/`.markdown` 后缀；`posterPath` 也必须位于 `.showcase/`，并使用 `.html`/`.htm` 后缀。报告、摘要和海报不能指定为同一个文件。

插件还会做轻量时效审查：会比较报告时间与已发现的布局源码、报告中的 Git 文件、测试回执和截图采集时间，也会检查截图文件是否在采集后被替换。发现冲突时，Markdown 和工具返回值会列出 `freshnessWarnings`。这不会阻止失败/部分报告的复核，但提示你先重新运行采集再做最终交付。

`showcase_layout_summary` 的参数示例：

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

只有 `projectPath` 必填。`locale` 可选，默认值为 `zh-CN`；传入 `en` 可生成英文输出。`outputPath`、`posterPath` 和 `generatePoster` 均只对本次调用生效，不会写入 DSH 设置；省略 `generatePoster` 时使用设置中的开关状态。当前版本故意不把主题作为工具参数；需要换风格时，请先在插件设置中选择，再进行下一次调用。插件不依赖本仓库的 React 布局：会自动寻找常见的 React、Node、Python 和静态 HTML 源文件；项目没有布局源码时，会安全回退到默认阶段，不会因此中断。项目结构特殊时，可用 `appPath` 或 `cssPath` 指定源码位置。生成的产物保留在本地项目中。

### 通用适配与边界

这不是 `dsh-showcase` 专用的页面模板。海报中的项目名、任务、Git 文件、测试回执、产物路径和证据状态均来自当前项目的 `.showcase/report.json` 与项目内文件；两种主题使用同一份交付数据，只是视觉表达不同。报告没有 `project.name` 时，产物会显示“未命名项目”，不会回退为插件仓库名。

- 后端、CLI、库和静态站点均可生成报告；找不到界面源码时，截图会明确标为“非必需”，而不是伪造 UI 证据。
- 没有 Git、没有测试、空产物、跨主题截图、未标注截图或不可读截图都会以明确状态输出，不会声明“已验证”。
- 为避免异常项目拖垮插件，报告最大为 2 MiB，单个源码文件最大为 2 MiB，单张嵌入截图最大为 8 MiB 且尺寸不超过 16384 px；每张海报最多嵌入 3 张已校验、当前主题匹配的截图。
- 项目目录遍历会跳过常见依赖与构建目录，并限制深度与数量；所有读写路径都必须落在当前项目的 `.showcase/` 目录或项目内部。

直接从代码导入 `generateLayoutSummary()` 时，为兼容早期调用方，`generatePoster` 的默认值仍是 `true`；DSH 工具的默认策略则由设置开关控制，并默认只生成 Markdown。第三方代码若不需要海报，应显式传入 `generatePoster: false`。

例如，Python 或静态 HTML 项目无需创建 `src/App.tsx` 也可以直接调用：

```json
{
  "projectPath": "C:/work/ledger-api",
  "appPath": "service/main.py",
  "cssPath": "web/theme.css",
  "locale": "en"
}
```

## 开发命令

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run cli -- init
npm run cli -- capture
```

## 项目结构

```text
src/
  cli/          本地 init 与 capture 命令
  core/         报告 schema、Git 采集、命令回执、脱敏
  App.tsx       报告界面和主题支持
plugin/
  index.js      DSH 插件注册
  layout-summary.js
                本地布局摘要和自包含海报生成器
  assets/       插件海报素材
docs/assets/    README 报告截图
```

## 路线图

- 为 capture 扩展响应式截图采集。
- 从 CLI 导出更多静态报告产物。
- 在保持本地优先报告格式的前提下，增加更多编程 Agent 适配器。

## 隐私

报告在本地生成。写入报告前，采集到的测试输出会经过常见凭据和本机绝对路径的脱敏规则。分享前仍应审查生成产物：脱敏规则可降低意外泄露风险，但无法保证识别所有敏感信息。

仓库许可证范围和演示角色素材的单独声明见 [CHARACTER_ASSET_NOTICE.md](CHARACTER_ASSET_NOTICE.md)。

## 许可证

MIT，详见 [LICENSE](LICENSE)。
