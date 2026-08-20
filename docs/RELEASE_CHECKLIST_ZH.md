# 发布检查清单

## 代码与测试

- [ ] `git status --short` 只包含计划发布的文件。
- [ ] `git diff --check` 没有空白错误。
- [ ] `npm run check` 全部通过。
- [ ] Node.js 20 和 22 的 GitHub Actions CI 通过。
- [ ] `npm pack --dry-run --json` 只包含运行时、README、许可证和必要素材。
- [ ] 包中不包含 `src/`、`tests/`、`dist/`、`.showcase/`、日志、Source Map 或 `tsbuildinfo`。

## 功能验收

- [ ] 在至少一个非 `dsh-showcase` 项目中生成 Markdown 摘要。
- [ ] 在至少一个前端项目和一个无界面项目中生成产物。
- [ ] 终末地帝江号与蓝色大肥鱼主题分别生成一次 HTML 海报。
- [ ] 桌面、平板和移动端没有文本溢出、遮挡或横向滚动。
- [ ] `completed`、`partial`、`failed` 三种状态均不会误报。
- [ ] 没有 Git、没有测试、空截图和跨主题截图的边界提示正确。

## 安全与隐私

- [ ] 运行凭据扫描，没有真实 API key、Token、Cookie 或私钥。
- [ ] `.showcase/` 和本机绝对路径未被提交。
- [ ] README 截图中没有私人项目名、账号、路径、聊天内容或密钥。
- [ ] 对外分享前人工打开 Markdown 与 HTML 产物复核脱敏结果。
- [ ] 安全联系方式和报告方式与 [SECURITY.md](../SECURITY.md) 一致。

## 素材与品牌

- [ ] 阅读 [CHARACTER_ASSET_NOTICE.md](../CHARACTER_ASSET_NOTICE.md)。
- [ ] 确认发布范围内每个演示素材的来源和使用权。
- [ ] 商业发布前替换未明确获得商业授权的演示素材。
- [ ] README 明确声明本项目不是 DeepSeek、DSH 或《终末地》的官方产品。

## GitHub 与 npm

- [ ] `package.json` 的版本、描述、仓库、主页、Issue 地址正确。
- [ ] `CHANGELOG.md` 已更新。
- [ ] Git Tag 与 `package.json` 版本一致。
- [ ] GitHub Release 说明包含新功能、修复、已知限制和升级方式。
- [ ] npm 包名仍可用，并确认 npm 账号与二次验证状态。
- [ ] 只有在明确决定公开发布时才运行 `npm publish`。
