# 免费 Skill 1.0.0

DSH Showcase 现在可以作为标准 Skill 使用：支持本地终端的 Agent 不必启动 DSH，也能从真实 Git 改动、测试回执和可选截图生成可核验的交付报告。

## 安装与使用

从本发行页下载 `dsh-showcase-skill-1.0.0.zip`，将完整的 `dsh-showcase` 目录安装到客户端的 Skill 目录。需要 Node.js 22.19+ 或 24+；不需要额外执行 npm install，也不需要 API Key。ZIP 的 SHA-256 校验文件随发行附件提供。

对 Agent 说：“使用 dsh-showcase，为当前项目生成中文交付报告，先检查测试计划，保留真实失败和缺失证据。”

提供工业编辑风和蓝色鲸鱼娘两种主题，输出为 `.showcase/report.json`、`layout-summary.md` 与可离线打开的 `layout-poster.html`。

## 行为与边界

- 先 `plan` 查看配置，再通过明确的 `--run-tests` 开关采集。测试在当前用户权限下运行，可能修改项目或联网，工具不会替用户沙箱隔离这些命令。
- 失败回执会保留；没有测试、没有 Git 或视觉证据不足会明确显示不完整，不伪装验证通过。
- 不自动上传项目、提交 Git 或发布产物；分享前应检查敏感信息，自动脱敏不构成完整隐私保证。
- 完整 ZIP 已包含依赖与许可。只通过文本/MCP 收到说明时，仍需安装完整运行包，不能仅凭说明生成真实回执。

Skill 独立版本为 1.0.0，报告引擎来自 npm 插件 0.1.8。本次不会把 npm 版本升级到 1.0.0，也不会改变 DSH 插件安装方式。

源码、问题反馈与后续更新：https://github.com/DoveLi-Gu/dsh-showcase
