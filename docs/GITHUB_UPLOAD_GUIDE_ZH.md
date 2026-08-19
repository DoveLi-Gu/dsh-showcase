# dsh-showcase 上传 GitHub 指南

这份指南按当前仓库的实际状态编写：仓库已经有本地 Git 历史，当前分支是 `main`，还没有配置远程仓库。上传 GitHub 分成两件事：

- **commit（提交）**：把一个可回退的版本保存到本机 Git 历史，不会上传。
- **push（推送）**：把本机已有的 commit 上传到 GitHub。

推荐做法是平时按功能或里程碑提交，完成一轮验收后推送；不需要每改一行就上传，也不建议拖到项目全部结束才第一次提交。

## 0. 先做安全检查

公开仓库前不要把 API key、`.env`、Cookie、私钥或本机路径提交进去。你之前在对话中使用过第三方 API key，正式公开仓库前建议到对应服务商后台**撤销并重新生成**，即使它没有出现在本仓库历史中也一样。

在 `H:\\dsh-showcase` 打开 PowerShell，先检查：

```powershell
Set-Location H:\\dsh-showcase
git status --short
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' '(api[_-]?key|authorization|bearer\\s+|sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9_]{20,})' .
```

如果第二条命令找到真实密钥，先移除或替换为测试占位符，再继续。

## 1. 本地验收

在第一次公开上传前，建议运行：

```powershell
npm test
npm run typecheck
npm run build
git diff --check
git status --short
```

确认 `.gitignore` 已经排除 `node_modules/`、`dist/`、`.showcase/`、临时输出和本机工具目录。`.showcase/` 是运行时报告目录，通常不应上传；README 需要展示的固定图片放在 `docs/assets/`。

查看将要提交的改动：

```powershell
git diff --stat
git diff -- README.md README.zh-CN.md plugin tests
```

## 2. 创建 GitHub 空仓库

1. 登录 GitHub，点击右上角 `+`，选择 **New repository**。
2. 仓库名建议使用 `dsh-showcase`；简介可以写 `Local, verifiable delivery evidence for coding-agent work.`。
3. 选择 `Public`（希望别人看到和点 Star）或 `Private`（先自己验收）。
4. **不要勾选** `Add a README file`、`.gitignore` 或 License 初始化，因为本地仓库已经有这些文件；勾选后会产生两个不相干的初始历史，第一次推送更容易冲突。
5. 点击 **Create repository**。

创建完成后先不要在网页里上传文件，保留 GitHub 显示的仓库地址即可。

## 3. 第一次本地提交

先把改动放入暂存区。第一次可以整体加入，但务必先看一遍状态：

```powershell
git add .
git status --short
```

如果发现不该提交的文件，用下面的命令撤回暂存，不会删除本地文件：

```powershell
git restore --staged path\\to\\file
```

确认后提交：

```powershell
git commit -m "feat: harden layout summary boundaries"
```

如果 Git 第一次要求填写身份，只需设置一次：

```powershell
git config --global user.name "你的 GitHub 显示名"
git config --global user.email "你的 GitHub 邮箱"
```

邮箱可以使用 GitHub 提供的 `noreply` 地址，避免公开真实邮箱。

## 4. 绑定并推送到 GitHub

把下面的占位符替换成你的 GitHub 用户名和仓库名：

```powershell
git remote add origin https://github.com/你的用户名/dsh-showcase.git
git remote -v
git push -u origin main
```

Windows 通常会打开 Git Credential Manager，让你在浏览器完成 GitHub 登录。登录成功后，凭据会交给系统凭据管理器保存；**不要**把 token 直接写进远程 URL，也不要把 token 粘贴进源代码。

如果提示 `remote origin already exists`，不要再次添加，改用：

```powershell
git remote set-url origin https://github.com/你的用户名/dsh-showcase.git
git push -u origin main
```

推送完成后刷新 GitHub 仓库页面，应该能看到 README、`plugin/`、`src/`、`tests/` 和 `docs/`。

## 5. 以后如何更新

推荐一个功能或一个验收里程碑一个 commit：

```powershell
Set-Location H:\\dsh-showcase
git status
npm test
git add plugin tests README.md README.zh-CN.md docs
git commit -m "test: cover cross-project poster boundaries"
git push
```

如果改动很多，可以先拆成多个提交，例如：

```powershell
git add plugin tests
git commit -m "fix: validate evidence and artifact paths"
git add README.md README.zh-CN.md docs
git commit -m "docs: explain generation and GitHub upload"
git push
```

这样 GitHub 的提交记录更容易阅读，也方便之后定位问题。正常情况下不要使用 `git push --force`。

## 6. 常见情况

### GitHub 页面已经有 README

如果创建仓库时误勾选了 README，先不要强行覆盖。可以先保存本地改动，再执行：

```powershell
git pull --rebase origin main
git push -u origin main
```

出现冲突时，先解决冲突文件，再运行 `git add <文件>`、`git rebase --continue`，最后再推送。

### 推送时提示没有权限

确认远程地址属于你登录的 GitHub 账号：

```powershell
git remote -v
```

如果组织仓库需要权限，使用有写入权限的账号登录 Git Credential Manager。不要把别人的 token 借来使用。

### 想确认提交是否成功

```powershell
git log --oneline --decorate -5
git status
```

看到 `Your branch is up to date with 'origin/main'`，并且工作区没有未提交改动，就说明本机和 GitHub 已同步。

## 7. 让项目更容易获得 Star

- README 第一屏保留一张桌面海报和一句清晰定位。
- 在 GitHub 仓库的 **About** 中填写简介和 `deepseek`、`dsh`、`plugin`、`developer-tools` 等 Topics。
- 保留 `LICENSE`、CI 状态和可复制的 Quick Start。
- 发布一个 `v0.1.0` Release，说明目前支持的两个主题、跨项目发现和边界校验。
- 不要把运行时 `.showcase/`、大体积临时截图、API key 或本机路径推到公开仓库。

官方参考：

- [Adding locally hosted code to GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/adding-locally-hosted-code-to-github)
- [Managing remote repositories](https://docs.github.com/en/get-started/git-basics/managing-remote-repositories)
- [GitHub Desktop: adding a repository from your local computer](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop)
