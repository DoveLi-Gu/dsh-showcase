# GitHub 上传与维护指南

本仓库已经绑定远程地址：

```text
https://github.com/DoveLi-Gu/dsh-showcase.git
```

当前默认分支是 `main`。因此后续维护不需要重新创建仓库或重复执行 `git remote add origin`。

## 第一次在新电脑上维护

建议安装：

- Git for Windows
- Node.js 20 或更新的 LTS 版本
- Visual Studio Code 或其他代码编辑器
- 可选：GitHub Desktop，适合查看改动和提交历史
- 可选：GitHub CLI，用于创建 Release、Issue 和管理仓库

克隆并验证：

```powershell
git clone https://github.com/DoveLi-Gu/dsh-showcase.git
Set-Location .\dsh-showcase
npm ci
npm run check
```

## 日常更新

```powershell
Set-Location C:\work\dsh-showcase
git pull --ff-only
git status --short
npm run check
git add -A
git diff --cached --stat
git commit -m "fix: describe the change"
git push origin main
```

`git pull --ff-only` 会在远程包含本地没有的新提交时停止，而不是自动制造合并提交。遇到停止时先检查远程改动，不要直接强制推送。

## 提交前必须检查

```powershell
git diff --check
npm run check
git status --short
```

公开仓库前再做一次凭据扫描：

```powershell
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**' `
  '(api[_-]?key|authorization|bearer\s+|sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9_]{20,}|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY)' .
```

测试用的假密钥可以保留，但必须有明显的 `test`、`example` 或 `[REDACTED]` 标记。真实 API key、`.env`、Cookie、私钥、本机日志和 `.showcase/` 产物不能提交。

## GitHub 登录

普通 `git push` 推荐使用 Git Credential Manager。第一次推送时 Windows 会打开浏览器登录，之后由系统凭据管理器保存授权。

GitHub CLI 是可选工具。使用前运行：

```powershell
gh auth login
gh auth status
```

不要把 Personal Access Token 写进远程 URL、README、脚本或 Git 配置文件。

## 发布版本

准备发布 `v0.1.0` 时：

```powershell
npm run check
git status
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

然后在 GitHub 的 **Releases → Draft a new release** 中选择这个 Tag，并根据 [RELEASE_CHECKLIST_ZH.md](RELEASE_CHECKLIST_ZH.md) 填写说明。

发布 npm 包属于外部发布动作，应在确认包名、账号、二次验证和演示素材授权后单独执行：

```powershell
npm login
npm publish
```

仓库已经配置 `prepublishOnly`，发布前会自动执行类型检查、测试、构建和包清单检查。

## 不要做的操作

- 不要使用 `git push --force` 覆盖 `main`。
- 不要使用 `git reset --hard` 清理不明来源的改动。
- 不要提交 `node_modules/`、`dist/`、`.showcase/`、日志或临时截图。
- 不要在 GitHub Issue 中粘贴私有项目报告、截图或密钥。
- 不要在未确认素材授权前把演示资源用于商业发布。

GitHub 官方参考：

- https://docs.github.com/en/get-started/using-git/about-git
- https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
- https://docs.github.com/en/get-started/git-basics/managing-remote-repositories
- https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
