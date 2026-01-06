# 本项目的 CI & CD（面试向讲解稿）

> 目标：你看完这份文档，能用“文件 + 行号”把本仓库的 CI/CD 讲清楚，并能解释为什么最后能通过一个 GitHub Pages 的网址访问到站点。

---

## 0. 先用一句话概括（TL;DR）

当你 `git push` 到 `master` 后，GitHub Actions 会按工作流执行：

1. **CI（持续集成）**：拉代码 → 装依赖 → 跑测试（或检查）
2. **构建**：构建 VitePress 文档站点（生成静态文件 `index.html` 等）
3. **CD（持续交付/持续部署）**：把构建产物发布到 `gh-pages` 分支
4. **GitHub Pages**：配置为从 `gh-pages` 分支根目录提供静态站点，所以最终可以通过固定 URL 访问

你可以把这条链路记成：

`push -> Actions(测试) -> Actions(构建文档) -> Actions(推送 gh-pages) -> Pages(托管静态站点)`

---

## 1. CI 和 CD 到底是什么？（给面试官的定义）

### 1.1 CI（Continuous Integration，持续集成）

CI 的核心思想：

- **频繁提交代码**（push/PR）
- **自动化验证**（安装依赖、lint、typecheck、单测、构建等）
- **尽早发现问题**（让错误在合并之前、上线之前暴露）

面试答法：

> CI = 自动化“质量检查 + 构建验证”，保证主分支随时可用。

### 1.2 CD（Continuous Delivery / Continuous Deployment）

CD 有两种常见含义：

- **持续交付（Delivery）**：构建/打包到“可发布状态”，但是否发布可能需要人工确认。
- **持续部署（Deployment）**：通过流水线自动部署到线上环境（无需人工干预）。

本仓库更接近“持续部署”：一旦 push 到 `master`，就自动部署到 GitHub Pages。

---

## 2. 本仓库的 CI/CD 入口文件在哪里？（重点：文件 + 行号）

### 2.1 GitHub Actions 工作流（CI/CD 的“总开关”）

工作流文件：

- `../.github/workflows/test-and-deploy.yaml`
  - 触发条件：见第 3 行（`on:`）和第 4-6 行（push 到 `master`）
  - 三个 job：见第 11 行（`jobs:`）之后的 `test/build/deploy`

关键行号（建议你背下来并能解释）：

- 触发：`../.github/workflows/test-and-deploy.yaml#L3-L6`
- CI（测试 job）：`../.github/workflows/test-and-deploy.yaml#L13-L31`
- 构建文档（build job）：`../.github/workflows/test-and-deploy.yaml#L33-L58`
- 部署 Pages（deploy job）：`../.github/workflows/test-and-deploy.yaml#L60-L75`

### 2.2 构建脚本入口（根 package.json）

工作流里执行了 `npm run test` 和 `npm run docs:build`，这些脚本定义在：

- `../package.json#L7-L17`

其中：

- `test`：`../package.json#L7`
- `docs:build`：`../package.json#L16`

### 2.3 文档站点配置（VitePress）

VitePress 的站点配置在：

- `../docs/.vitepress/config.mts#L1-L30`

其中最关键的是 `base`（项目 Pages 必须配置对）：

- `base: "/Limer-Ui/"`：`../docs/.vitepress/config.mts#L7`

---

## 3. CI 流程（test job）一步步讲清楚

CI 发生在 `test` 这个 job 里：`../.github/workflows/test-and-deploy.yaml#L13-L31`

### 3.1 触发时机

当你 push 到 `master` 分支，就会触发整个 workflow：

- `../.github/workflows/test-and-deploy.yaml#L3-L6`

### 3.2 Runner 环境

该 job 使用 GitHub 提供的 Linux 虚拟机：

- `runs-on: ubuntu-latest`：`../.github/workflows/test-and-deploy.yaml#L15`

面试点：

> runner 是执行流水线的机器环境，常见有 `ubuntu-latest/windows-latest/macos-latest` 或自建 runner。

### 3.3 具体步骤（steps）

1. **拉取代码**

- `actions/checkout@v3`：`../.github/workflows/test-and-deploy.yaml#L17-L19`

解释：把仓库代码 checkout 到 runner 的工作目录。

2. **安装 Node 环境**

- `actions/setup-node@v3`：`../.github/workflows/test-and-deploy.yaml#L20-L22`

解释：在 runner 上准备 Node.js（当前文件未指定版本，默认会用 action 的默认策略；面试时可补充“建议锁定 Node 版本保证一致性”）。

3. **安装 pnpm**

- `npm install -g pnpm`：`../.github/workflows/test-and-deploy.yaml#L24-L25`

解释：由于项目使用 pnpm monorepo，所以需要先装 pnpm。

4. **安装依赖（严格锁定 lockfile）**

- `pnpm install --frozen-lockfile`：`../.github/workflows/test-and-deploy.yaml#L26-L28`

解释：

- `--frozen-lockfile` 代表“lockfile 必须和 package.json 对得上”，如果依赖变了但没提交 `pnpm-lock.yaml`，CI 会直接失败。
- 这是大厂常见要求：保证 CI 环境可复现。

5. **运行测试**

- `npm run test`：`../.github/workflows/test-and-deploy.yaml#L29-L31`

而 `test` 脚本目前是：

- `"test": "echo 'todo'"`：`../package.json#L7`

解释：这意味着目前 CI 的“测试”阶段只是占位，不会真正跑单测；面试时你可以补充“后续可替换为 vitest/jest 或 typecheck”。

---

## 4. 构建流程（build job）：构建 VitePress 静态站点

build job 在 test job 成功后才会执行：

- `needs: test`：`../.github/workflows/test-and-deploy.yaml#L36`

### 4.1 为什么要 `needs`？

面试答法：

> `needs` 是 job 之间的依赖关系：测试不过就不构建、不部署，防止把坏版本发布出去。

### 4.2 build job 做了什么？

它的前几步（checkout、setup node、install pnpm、install deps）和 test job 基本一致：

- 重新 checkout：`../.github/workflows/test-and-deploy.yaml#L38-L40`
- setup node：`../.github/workflows/test-and-deploy.yaml#L41-L43`
- 安装 pnpm：`../.github/workflows/test-and-deploy.yaml#L45-L46`
- 安装依赖：`../.github/workflows/test-and-deploy.yaml#L47-L49`

然后执行构建文档：

- `npm run docs:build`：`../.github/workflows/test-and-deploy.yaml#L50-L52`

### 4.3 `docs:build` 到底做了什么？

根脚本里：

- `"docs:build": "pnpm --filter ./docs build"`：`../package.json#L16`

解释：

- `pnpm --filter ./docs build` 的意思是：只在 `docs` 这个 workspace package 里执行 `build` 脚本。
- `docs` 自身是一个 package（有自己的 package.json）：`../docs/package.json`

`docs` 包的 build 脚本是：

- `"build": "vitepress build"`：见 `../docs/package.json` 的 `scripts.build`

最终 `vitepress build` 会输出静态文件到默认目录：

- `docs/.vitepress/dist/`（包含 `index.html`、assets 等）

### 4.4 为什么要 upload artifact？

build job 最后一步：

- `actions/upload-artifact@v4`：`../.github/workflows/test-and-deploy.yaml#L53-L58`

它把 `./docs/.vitepress/dist` 上传为名为 `docs` 的 artifact。

面试点：

> artifact 是“job 之间传递构建产物”的标准方式：build job 产出 dist，deploy job 再下载它做发布。

---

## 5. 部署流程（deploy job）：把 dist 发布到 gh-pages

deploy job 在 build 成功后执行：

- `needs: build`：`../.github/workflows/test-and-deploy.yaml#L63`

### 5.1 下载构建产物

- `actions/download-artifact@v4`：`../.github/workflows/test-and-deploy.yaml#L64-L69`

它把名为 `docs` 的 artifact 下载并解压到：

- `./docs-dist`：`../.github/workflows/test-and-deploy.yaml#L68`

### 5.2 发布到 GitHub Pages（本质：推送 gh-pages 分支）

部署动作使用了一个成熟的第三方 action：

- `peaceiris/actions-gh-pages@v3`：`../.github/workflows/test-and-deploy.yaml#L70-L75`

关键参数：

- `publish_dir: ./docs-dist`：`../.github/workflows/test-and-deploy.yaml#L74`

解释：

- 这个 action 会把 `publish_dir` 目录里的静态文件提交到 `gh-pages` 分支（默认行为），从而触发 Pages 更新。

### 5.3 Token 是干什么的？为什么要 secrets？

这里使用：

- `${{ secrets.GH_TOKEN }}`：`../.github/workflows/test-and-deploy.yaml#L73`

解释：

- Actions 要“向你的仓库推送 gh-pages 分支”，需要鉴权。
- `secrets.GH_TOKEN` 是你在 GitHub 仓库 Settings -> Secrets 里配置的 token。

面试补充：

- 很多项目会直接用 `${{ secrets.GITHUB_TOKEN }}`（GitHub 自动提供的 token），但需要配好 workflow 的权限。
- 本项目 workflow 已声明了权限：`contents: write`（允许写仓库内容）：`../.github/workflows/test-and-deploy.yaml#L8-L9`

---

## 6. 为什么你能用一个网址直接看到项目？（GitHub Pages 原理）

### 6.1 GitHub Pages 是什么

GitHub Pages 是 GitHub 提供的“静态站点托管服务”。它会把你仓库的某个分支（常见 `gh-pages`）里的静态文件，当作网站资源对外提供。

### 6.2 Project Pages 的 URL 规则

你的截图里是 **Project Pages**（项目站点），URL 规律是：

$$
https://<用户名>.github.io/<仓库名>/
$$

所以你仓库名是 `Limer-Ui`，最终访问一般是：

- `https://li-mer.github.io/Limer-Ui/`

### 6.3 为什么 VitePress 必须设置 base？

因为 Project Pages 不是挂在根域名 `/`，而是挂在 `/<仓库名>/` 路径下。

所以 VitePress 必须把资源路径前缀写对：

- `base: "/Limer-Ui/"`：`../docs/.vitepress/config.mts#L7`

如果 base 写错（比如大小写不一致），构建出来的 HTML 会引用错误的资源路径，最终页面就可能出现 404（找不到 CSS/JS，甚至找不到正确页面入口）。

### 6.4 为什么 Pages 有时会显示 404？（你之前遇到的典型原因）

404 通常只意味着一件事：**GitHub Pages 指向的分支/目录下没有 `index.html`**。

在这个仓库里可能发生的原因主要有：

1. **发布目录不对**：`publish_dir` 指向了不存在的目录或空目录 → `gh-pages` 推过去的内容是空的
2. **artifact 解压位置不确定**：deploy job 下载产物没有落在 `publish_dir` 下
3. **base 配错**：页面路径/资源路径与实际访问路径不一致

本仓库的部署逻辑是：把 `docs-dist` 目录发布（见 `publish_dir`）：`../.github/workflows/test-and-deploy.yaml#L74`

---

## 7. 我该去哪里看“流水线跑没跑过”？

### 7.1 Actions 日志

看每次 push 的 workflow 运行记录（每一步命令输出、失败原因）。

### 7.2 gh-pages 分支内容

确认 `gh-pages` 分支根目录是否有 `index.html`：

- 如果没有，Pages 必然 404。

### 7.3 Settings -> Pages

你截图里 Pages Source 选择了从 `gh-pages` 分支发布。只要该分支的根目录有 `index.html`，且 VitePress base 配对，最终 URL 就可访问。

---

## 8. 面试常问问题（结合本仓库可直接回答）

### Q1：你项目的 CI 做了什么？

答：

- push 到 `master` 会触发 workflow（`../.github/workflows/test-and-deploy.yaml#L3-L6`）
- 在 `ubuntu-latest` runner 上 checkout、setup node、安装 pnpm、用 `--frozen-lockfile` 安装依赖（`../.github/workflows/test-and-deploy.yaml#L17-L28`）
- 执行 `npm run test` 做质量验证（`../.github/workflows/test-and-deploy.yaml#L29-L31`），脚本在 `../package.json#L7`

### Q2：你项目的 CD 怎么做的？

答：

- build job 构建 VitePress：`npm run docs:build`（`../.github/workflows/test-and-deploy.yaml#L50-L52`，脚本在 `../package.json#L16`）
- 构建产物 `docs/.vitepress/dist` 通过 artifact 传给 deploy job（`../.github/workflows/test-and-deploy.yaml#L53-L58`）
- deploy job 下载 artifact 到 `docs-dist` 并发布到 gh-pages（`../.github/workflows/test-and-deploy.yaml#L64-L75`）

### Q3：为什么要用 artifact？直接在 deploy job 重新 build 不行吗？

答：

- 可以，但 artifact 更标准：build 产物一次生成、多处复用，且部署时不必重复耗时构建。
- 还能把 build 与 deploy 解耦，排查问题更清晰。

### Q4：为什么 GitHub Pages 访问路径要带仓库名？

答：

- 因为这是 Project Pages，URL 规则固定为 `https://<user>.github.io/<repo>/`，所以 VitePress `base` 必须是 `/<repo>/`（本仓库是 `../docs/.vitepress/config.mts#L7`）。

---

## 9. 你可以立即练习的“复述模板”（30 秒版本）

> 我们在 `.github/workflows/test-and-deploy.yaml` 里配置了 GitHub Actions。push 到 master 会触发流水线：先在 test job 里 checkout、setup node、pnpm install 并跑 test；通过后 build job 运行 `npm run docs:build`，用 pnpm filter 在 docs 包里执行 `vitepress build` 生成静态文件，然后把 dist 上传成 artifact；最后 deploy job 下载 artifact 并用 `peaceiris/actions-gh-pages` 把 dist 推到 gh-pages 分支。GitHub Pages 配置从 gh-pages 分支根目录发布，所以最终能通过 `https://<user>.github.io/<repo>/` 访问。因为是项目 Pages，VitePress 的 base 必须配置为 `/<repo>/`，本项目在 `docs/.vitepress/config.mts` 里设置为 `/Limer-Ui/`。
