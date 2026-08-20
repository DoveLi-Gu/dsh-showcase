# 贡献指南

感谢你改进 `dsh-showcase`。本项目优先保证跨项目适用、证据真实性、本地隐私和可维护性。

## 开发环境

- Node.js 20 或更高版本
- npm 10 或更高版本
- Windows、macOS 或 Linux

```bash
npm ci
npm run check
```

## 工作原则

- 不为单个演示项目写死项目名、任务、文件或截图。
- 不把 `partial`、`failed` 或缺失证据包装成成功。
- 所有生成路径必须留在目标项目内部；交付产物必须位于 `.showcase/`。
- 新增输入必须考虑超长文本、Unicode、特殊路径、无 Git、无测试和损坏图片。
- 修改主题或响应式布局时，同时检查桌面和移动端。
- 不提交真实密钥、私有报告、`.showcase/`、`dist/` 或临时日志。

## 提交改动

1. 从最新 `main` 创建分支。
2. 保持改动聚焦，并为行为变化增加测试。
3. 运行 `npm run check`。
4. 更新 README 或 CHANGELOG 中受影响的说明。
5. 提交清晰的 Conventional Commit，例如：

```text
feat: add a new evidence source
fix: prevent poster path traversal
docs: clarify DSH installation
test: cover no-git projects
```

## Pull Request

PR 描述应说明：

- 解决了什么问题。
- 行为或输出发生了什么变化。
- 如何验证。
- 是否涉及素材、隐私、路径或兼容性风险。
- UI 改动应附桌面和移动端截图。

报告安全问题时不要创建公开 Issue，请阅读 [SECURITY.md](SECURITY.md)。
