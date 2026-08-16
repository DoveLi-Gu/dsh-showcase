# DeepSeek Harness 高星 GitHub 项目方向建议

> 调研日期：2026-08-16  
> 结论版本：v0.1  
> 推荐项目工作名：`dsh-showcase`

## 1. 先纠正项目名称

这次 DeepSeek 发布的是 **DeepSeek Harness**，不是 Hermes。命令行名称为 `dsh`，官方定位是：

> Everything is a Plugin.

官方仓库于 2026-08-13 发布，目前仍处于 developer preview。它允许通过插件替换或扩展模型、工具、技能、子代理、上下文压缩、权限策略、遥测、Web UI 等模块。

官方仓库：<https://github.com/deepseek-ai/deepseek-harness>

## 2. GitHub 生态现状

Harness 发布后，社区项目增长非常快，但热门方向已经明显拥挤。

### 已经拥挤，不建议直接跟做

| 方向 | 当前情况 | 判断 |
|---|---|---|
| 桌面客户端、Web UI、TUI | 已有多套高星实现 | 除非有明显技术突破，否则容易成为第 N 个壳 |
| 插件市场、Awesome List | 同类仓库很多，已有项目率先占据流量 | 维护成本高，差异化弱 |
| 主题、皮肤、桌宠 | 很容易获得第一波传播，但生命周期短 | 适合做附属功能，不适合当核心产品 |
| 长期记忆、上下文面板 | 已有多套插件 | 技术门槛不低，用户也难快速感知差异 |
| 浏览器、联网搜索、视觉能力 | 已有较成熟项目 | 需要资源、模型或服务成本，竞争激烈 |
| VS Code 扩展 | 官方讨论中需求很高，但社区已快速跟进 | 可以做集成，不建议只做编辑器外壳 |
| 会话回放、代码 Diff、溯源 | 已经有单点插件 | 仍有组合创新空间，但不能只做回放 |

参考生态：

- 精选插件列表：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
- DSH Web UI：<https://github.com/zhu1090093659/dsh-web-ui>
- DSH TUI：<https://github.com/ccch1mneyyy/dsh-TUI>
- 插件市场：<https://github.com/dsh-market/dsh-market>
- 会话回放：<https://github.com/QoderAutomation/dsh-agent-replay>
- 变更溯源：<https://github.com/silenTTX/dsh-lineage>
- Diff 插件：<https://github.com/bansbo/dsh-diff>

## 3. 推荐方向：dsh-showcase

### 一句话定义

**把 Agent 的“我已经做完了”，变成任何人都能看懂、检查和分享的交付证明。**

用户完成一次 DSH 编程任务后，`dsh-showcase` 自动生成一个漂亮的静态展示页，集中呈现：

- 用户原始目标；
- Agent 实际改了哪些文件；
- 关键代码前后差异；
- 执行过哪些测试，退出码是什么；
- 桌面端、平板端和手机端实际截图；
- UI 前后对比滑块；
- 构建产物和关键性能数据；
- 已自动脱敏的执行证据；
- 可放进 README、PR 或 GitHub Pages 的链接和封面图。

推荐英文标语：

> Your agent says it is done. Show the work.

推荐中文标语：

> Agent 说做完了，证据拿出来。

## 4. 为什么这个方向更有机会获得 Star

### 4.1 它解决的是普遍问题

现在的 Coding Agent 都会给出“已完成、测试通过”的总结，但用户仍然需要自己打开文件、运行项目、检查截图和整理 README。

`dsh-showcase` 把最后这段重复工作自动化，受众不只包括 DSH 用户，还包括：

- 独立开发者；
- Vibe Coding 用户；
- 开源项目维护者；
- 接收 Agent PR 的代码审查者；
- 需要向客户或团队展示成果的人；
- 使用 Codex、Claude Code、OpenCode 等其他 Agent 的用户。

### 4.2 它自带传播闭环

每一份生成的展示页都可以包含一个克制的小页脚：

> Generated with dsh-showcase

用户把报告贴进 README、PR、博客或社交平台时，也在自然传播项目。相比普通工具，展示页本身就是广告位。

### 4.3 它既实用，又容易做出视觉爆点

高星项目通常要让用户在几秒内看懂价值。这个项目可以用一张 GIF 完成演示：

1. DSH 完成任务；
2. 用户执行 `/showcase`；
3. 页面依次出现 Diff、测试收据、响应式截图和前后对比；
4. 最后生成 GitHub Pages 链接。

不需要读长篇介绍，用户看到动画就知道自己是否需要它。

### 4.4 它不是只吃一次 DSH 热度

仓库名称先用 `dsh-showcase` 抢占当前搜索流量，但架构应当从第一天就拆成：

- 通用报告核心；
- DSH 适配器；
- CLI；
- 后续可增加的 Codex、Claude Code、OpenCode 适配器。

这样即使 Harness 的关注度下降，项目仍然能继续成长。

## 5. 与已有项目的明确边界

`dsh-showcase` 不能只做“会话回放”，否则会直接撞上现有项目。

| 类型 | 主要回答的问题 |
|---|---|
| Session Replay | Agent 当时按什么顺序操作？ |
| Diff Viewer | 哪些代码发生了变化？ |
| Lineage / Trace | 某个变更由哪个提示词或工具调用产生？ |
| **dsh-showcase** | **最终做出了什么，是否验证过，如何让别人快速看懂并体验？** |

项目重点是最终交付物，而不是完整记录 Agent 的全部思考过程。

默认不采集或公开模型内部思维内容，只使用用户输入、公开回复、工具调用结果、Git Diff、测试结果和截图等可审计信息。

## 6. 第一版 MVP

第一版只做一个完整、稳定、可以录制演示的闭环。

### 必须完成

1. **项目扫描**
   - 读取 Git 状态和 Diff；
   - 识别改动文件、语言和变更规模；
   - 支持未提交改动和指定 Commit 范围。

2. **测试收据**
   - 记录用户配置的测试命令；
   - 保存命令、开始时间、耗时、退出码和关键输出；
   - 对测试结果生成可核验摘要。

3. **响应式截图**
   - 使用 Playwright；
   - 默认生成桌面、平板和手机三种视口；
   - 支持配置启动命令和目标 URL。

4. **前后对比**
   - 支持同一页面 Before / After 滑块；
   - 首版只需支持静态截图，不必做复杂视觉识别。

5. **隐私脱敏**
   - 默认遮盖 Token、Cookie、Authorization、常见密钥格式和本机绝对路径；
   - 生成前展示“即将公开的内容”清单；
   - 任何上传或发布动作必须由用户确认。

6. **静态报告导出**
   - 生成可离线打开的 `index.html`；
   - 同时生成 `report.json` 和社交分享封面；
   - 支持发布到 GitHub Pages。

7. **DSH 入口**
   - 提供 `/showcase` 命令或 Skill；
   - Web UI 中可以追加一个轻量的“生成展示”入口；
   - DSH 适配层保持足够薄。

### 第一版不要做

- 不做账号系统；
- 不做云端数据库；
- 不做插件市场；
- 不做完整视频编辑器；
- 不依赖额外 LLM API Key；
- 不采集模型私密思维过程；
- 不一开始支持所有 Coding Agent；
- 不做复杂团队权限系统。

## 7. 推荐技术架构

```text
dsh-showcase/
├─ apps/
│  └─ demo/                 # 官方在线演示和示例报告
├─ packages/
│  ├─ core/                 # 报告数据模型、Git 采集、脱敏
│  ├─ capture/              # Playwright 截图与页面元数据
│  ├─ renderer/             # 静态 HTML、封面图、README 片段
│  ├─ cli/                  # npx dsh-showcase
│  └─ dsh-plugin/           # DeepSeek Harness 薄适配器
├─ examples/
│  ├─ frontend-redesign/
│  ├─ bug-fix/
│  └─ cli-tool/
└─ docs/
```

推荐栈：

- TypeScript；
- Node.js；
- React + Vite；
- Playwright；
- `simple-git` 或直接调用结构化 Git 命令；
- Zod 校验 `report.json`；
- 静态 HTML 导出；
- Vitest；
- GitHub Actions。

## 8. 视觉方向

### 设计主题：Release Evidence Lab

整体像“产品发布现场”和“数字取证台”的结合，而不是普通后台仪表盘。

### 色彩

- 主背景：炭黑和冷白交替；
- 验证通过：高亮绿色；
- 重要动作：珊瑚红；
- 信息层：冰蓝；
- 禁止使用常见紫色渐变作为主视觉。

### 核心视觉记忆点

页面顶部使用一条稳定的交付轨道：

```text
PROMPT -> PLAN -> BUILD -> VERIFY -> SHIP
```

下方不是堆叠普通卡片，而是按“证据带”展开：

- 第一带：目标和结果；
- 第二带：真实产品截图；
- 第三带：代码变更；
- 第四带：测试与构建证据；
- 第五带：可复现方式和版本信息。

### 可借鉴的网络流行风格

- 轻微 Y2K 和复古终端质感；
- 像素化状态标记可以作为点缀；
- 现代编辑器式排版；
- 高密度但有秩序的数据展示；
- 动画聚焦于报告生成过程，不做满屏无意义特效。

这能吸收目前社区喜欢的复古、像素、终端和游戏化风格，同时保留专业工具的可信度。

## 9. 建议的安装与使用体验

独立 CLI：

```bash
npx dsh-showcase init
npx dsh-showcase capture
npx dsh-showcase open
```

DSH 中：

```text
/showcase
```

理想结果：

```text
Showcase created
  Report: .showcase/index.html
  Cover:  .showcase/cover.png
  Data:   .showcase/report.json
  Secrets redacted: 7
  Publish: waiting for confirmation
```

## 10. GitHub 冲星策略

### README 首屏

README 第一屏只放四件事：

1. 一句价值主张；
2. 6 至 10 秒的真实演示 GIF；
3. 一行安装命令；
4. 一个在线示例报告链接。

不要先写架构原理，也不要用大段“AI 改变世界”式文案。

### 首发必须准备的三个案例

1. **网站改版**：展示 Before / After 和三端截图；
2. **Bug 修复**：展示失败测试变为通过；
3. **CLI 工具**：证明它不只服务前端项目。

### 仓库语言

- README 默认英文；
- 提供完整中文 README；
- GIF 和界面尽量少依赖语言；
- Discussion 首发帖同时提供中英文版本。

### 推荐 Topics

```text
deepseek-harness
dsh-plugin
coding-agent
agent-observability
developer-tools
playwright
visual-regression
proof-of-work
vibe-coding
```

### 发布渠道

- DeepSeek Harness 官方 Discussions；
- `awesome-dsh-plugin`；
- GitHub Release；
- Hacker News 的 Show HN；
- Reddit 的开源、编程和 Local-first 社区；
- X、Bilibili、小红书的短 GIF 演示；
- 国内开发者社区。

## 11. 主要风险与应对

### Harness API 仍可能变化

应对：核心功能保持为独立 CLI，DSH 仅做薄适配器。即使插件接口变化，报告生成能力仍可使用。

### 报告可能泄露密钥或本机信息

应对：本地优先、默认不上传、规则脱敏、发布前预览、可配置忽略文件，并为导出内容生成审计清单。

### 容易被误解为另一个回放工具

应对：所有宣传都优先展示“最终产品、测试证据和 Before / After”，不要把工具调用时间线放在首屏。

### 功能过多导致第一版迟迟发不出去

应对：第一版只保证 Git Diff、测试收据、三端截图、静态报告和 DSH 命令五件事完整可用。

## 12. 五天 MVP 节奏

| 天数 | 目标 |
|---|---|
| Day 1 | 数据结构、Git 采集、脱敏规则 |
| Day 2 | Playwright 截图、测试收据 |
| Day 3 | 报告页面和静态导出 |
| Day 4 | DSH 命令、示例项目、自动化测试 |
| Day 5 | README、GIF、在线 Demo、首个 Release |

## 13. 最终建议

建议做：

> **`dsh-showcase`：面向 Coding Agent 的可验证成果展示器。**

不要把它做成 DSH 专属皮肤，也不要做成完整监控平台。先用 DSH 插件抢当前窗口，再通过独立 CLI 和开放报告格式扩展到其他 Agent。

它最重要的产品原则是：

1. **一眼能看懂；**
2. **结果能验证；**
3. **默认保护隐私；**
4. **导出后方便传播；**
5. **不依赖云服务也能完整工作。**

这个方向不能保证获得高 Star，但在当前生态中，它比再做桌面端、插件列表、主题或普通回放工具更有差异化，也更容易通过真实演示形成持续传播。

## 14. 主要调研来源

- DeepSeek Harness 官方仓库：<https://github.com/deepseek-ai/deepseek-harness>
- 官方插件接口文档：<https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/plugin-interfaces.md>
- 官方社区发帖规范：<https://github.com/deepseek-ai/deepseek-harness/discussions/1797>
- 官方插件市场建议讨论：<https://github.com/deepseek-ai/deepseek-harness/discussions/1115>
- 官方代码 Diff 需求讨论：<https://github.com/deepseek-ai/deepseek-harness/discussions/744>
- Awesome DSH Plugin：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
- DSH Works 插件目录：<https://dshworks.com/>
