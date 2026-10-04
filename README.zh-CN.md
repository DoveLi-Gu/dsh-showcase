# dsh-showcase 中文说明

`dsh-showcase` 是一个本地优先的 DSH 插件。它在任意目标项目中读取 Git 改动、测试回执和可选的响应式截图，生成中文 Markdown 摘要与自包含 HTML 交付海报。

完整的功能、安装、三步使用流程、截图规则、边界条件和主题预览都在主 README 中：

[打开 README.md](README.md)

赞助商：**鸽子中转站（Pigeon API Relay）**。它兼容 OpenAI API 格式，当前重点覆盖 GPT-6、GPT-5.6、Claude Opus/Fable/Sonnet 5、DeepSeek V4、Gemini、Grok 及多种国产模型，并支持余额按量、日卡/月卡订阅及统一权益管理。站长还会不定期组织抽奖，赠送 Token、体验额度等福利；模型与活动详情以站内实时信息为准，完整介绍见主 README 快速开始后的赞助商区域。

本项目提供两套主题：

- **终末地帝江号**：机械工业、密集等高线、科技仪表和黄黑校准色；
- **蓝色大肥鱼**：浅蓝水面、钴蓝强调、角色主视觉和流动轨迹。

主题只在 DSH 插件设置里选择，目标项目不需要增加 `theme` 字段。

当前兼容 DSH `0.2.0-rc.2` 及同一 0.2 系列。安装后从 DSH 侧栏进入 **插件**，打开 `dsh-showcase`，在 `dsh-showcase/plugin` 行点击 **配置**；Node.js 使用 `22.19+` 或 `24+`。旧版 DSH 0.1 不属于本版本的兼容目标。

维护与发布相关文档：

- [GitHub 上传与维护指南](docs/GITHUB_UPLOAD_GUIDE_ZH.md)
- [发布检查清单](docs/RELEASE_CHECKLIST_ZH.md)
- [贡献指南](CONTRIBUTING.md)
- [安全策略](SECURITY.md)
