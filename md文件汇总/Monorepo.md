# 从零搭建 pnpm Monorepo（按文章内容给小白的操作清单）

> 来源文章：https://juejin.cn/post/7146183222425518093
>
> 说明：我已通过工具抓取到该链接的正文内容，并结合你工作区的 [汇总.md](汇总.md) 进行核对后整理出本清单。

---

## 你要达成什么

- 用 **pnpm 的 monorepo（workspace）** 管理一个仓库里的多个项目/包。
- 目录大致分为：
  - `packages/*`：真正要发布/复用的包（组件包、工具包、主题包等）
  - `play`：本地开发调试环境（类似 playground，用来跑你写的组件）
  - `docs`：组件文档（文章提到，但本文不展开）

---

## 0. 约定：什么是“根目录”

后面所有“根目录”指的是：

- 你的仓库顶层目录（包含 `package.json`、`pnpm-workspace.yaml` 的那个目录）
- 在你当前电脑上，就是：`d:\Web\MyComponents`

---

## 1. 安装 pnpm（全局）

**在哪执行：** 任意目录都可以（全局安装不依赖项目目录）。

**执行命令：**

```bash
npm install pnpm -g
```

**作用：**

- 在你的电脑上安装 `pnpm` 命令行工具，后续才能用 `pnpm init / pnpm install / pnpm create ...`。

---

## 2. 初始化仓库根目录的 package.json

**在哪执行：** 根目录 `d:\Web\MyComponents`。

**执行命令：**

```bash
pnpm init
```

**作用：**

- 在根目录生成 `package.json`，用于管理整个 monorepo 的公共依赖、公共脚本。

**然后手动改配置（必须做）：**

打开根目录的 `package.json`：

- 删除 `name` 字段
- 添加/确保有：`"private": true`

**作用：**

- 根目录一般不发布到 npm，所以设为私有（`private: true`），并去掉包名避免误发布。

文章给的示例结构大概是：

```json
{
  "private": true,
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## 3. 配置 pnpm workspace（monorepo 关键文件）

**你要创建的文件：** 根目录新建 `pnpm-workspace.yaml`

**把下面内容复制进去：**

```yaml
packages:
  - play # 存放组件测试/调试的代码（playground）
  - docs # 存放组件文档
  - packages/* # packages 目录下都是组件包
```

**作用：**

- 告诉 pnpm：哪些子目录属于同一个工作区（workspace）。
- workspace 内的包可以用 `workspace:*` 这种写法互相依赖，并被 pnpm 链接到一起。

---

## 4. 创建子包目录（packages/\*）并初始化各自的 package.json

**你要创建的目录结构（手动创建文件夹）：**

```text
根目录
├─ packages/
│  ├─ components/
│  ├─ theme-chalk/
│  └─ utils/
├─ play/
└─ docs/
```

> `docs/` 文章提到了；如果你暂时不做文档，也可以先不创建。

### 4.1 初始化 packages/components

**在哪执行：** `packages/components` 目录。

**执行命令：**

```bash
pnpm init
```

**然后修改 `packages/components/package.json`：**

把 `name` 改为：`@cobyte-ui/components`

文章示例：

```json
{
  "name": "@cobyte-ui/components",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 4.2 初始化 packages/theme-chalk 与 packages/utils

**在哪执行：** 分别进入对应目录：

- `packages/theme-chalk`
- `packages/utils`

**每个目录都执行：**

```bash
pnpm init
```

**然后分别把 package.json 的 name 改为：**

- `@cobyte-ui/theme-chalk`
- `@cobyte-ui/utils`

**作用：**

- 让每个子目录都是“独立 npm 包”的形态（都有自己的 `package.json`）。

---

## 5. 让仓库内部的包可以互相调用（workspace:\*）

文章的做法是：把这些 workspace 包安装到“根目录”的依赖里。

**在哪执行：** 根目录。

**执行命令：**

```bash
pnpm install @cobyte-ui/components -w
pnpm install @cobyte-ui/theme-chalk -w
pnpm install @cobyte-ui/utils -w
```

**作用：**

- `-w` 表示把依赖写进“workspace 根目录”的 `package.json`。
- 由于这些包就在本仓库 workspace 里，pnpm 会把它们以 workspace 方式链接起来。

**你会看到根目录 package.json 里出现类似内容：**

```json
{
  "dependencies": {
    "@cobyte-ui/components": "workspace:*",
    "@cobyte-ui/theme-chalk": "workspace:*",
    "@cobyte-ui/utils": "workspace:*"
  }
}
```

**`workspace:*` 的含义：**

- “依赖本仓库 workspace 里的同名包”，而不是去 npm registry 下载。
- 文章也提到发布时会把 `workspace:*` 替换成具体版本号（通常配合 changesets 等工具）。

---

## 6. 安装 TypeScript 基础依赖并初始化 tsconfig

### 6.1 安装依赖

**在哪执行：** 根目录。

**执行命令：**

```bash
pnpm install vue typescript @types/node -D -w
```

**作用：**

- `-D`：安装到开发依赖（开发时用，生产包不一定需要）。
- `-w`：写到根目录的 `package.json`。
- 安装后你就能在 workspace 里使用 `tsc`（TypeScript 编译器）等命令。

### 6.2 初始化 TypeScript 配置

**在哪执行：** 根目录。

**执行命令：**

```bash
pnpm tsc --init
```

**作用：**

- 生成 `tsconfig.json`，让 TS 知道如何编译/检查你的项目。

> 注意：文章后面会把 `tsconfig.json` 改成 project references 形式（见第 8 节）。

---

## 7. 创建 play（组件调试环境）

文章的目标：在 `packages/components` 写组件，在 `play` 里直接运行看效果。

### 7.1 用 Vite 创建 play 项目

**在哪执行：** 根目录。

**执行命令：**

```bash
pnpm create vite play --template vue-ts
```

**作用：**

- 在根目录下创建 `play/` 项目
- 模板为 Vue3 + TypeScript

### 7.2 安装 play 项目依赖

**在哪执行：** `play` 目录。

**执行命令：**

```bash
pnpm install
```

**作用：**

- 安装 `play` 这个子项目自己的依赖。

### 7.3 在根目录一键启动 play（不用每次 cd）

**你要修改的文件：** 根目录 `package.json`

**把 scripts 加一条：**

```json
{
  "scripts": {
    "dev": "pnpm -C play dev"
  }
}
```

**作用：**

- `pnpm -C play dev` 的意思是：切到 `play` 目录执行它的 `pnpm dev`（等价于你先 `cd play` 再跑 dev）。
- 之后你可以在根目录直接执行：

```bash
pnpm run dev
```

---

## 8. TypeScript 的 Monorepo（Project References）设置

文章的核心思路：

- 你的仓库按功能拆成多个 TS “子项目”（组件包、play、测试等）
- 子项目之间有依赖，但互相尽量解耦
- 通过 TS 的 `references` 和 `composite` 提升编译/检查性能

### 8.1 根目录 tsconfig.json（改成 references 入口）

**你要编辑的文件：** 根目录 `tsconfig.json`

**替换为（文章示例）：**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.web.json" },
    { "path": "./tsconfig.play.json" },
    { "path": "./tsconfig.vitest.json" }
  ]
}
```

**作用：**

- 把整个仓库的 TS 工程拆成多个“可单独检查/增量构建”的部分。

> 说明：文章引用了 `tsconfig.vitest.json`，但在你这篇内容里没有给出它的具体配置。你需要在引入测试（vitest）时再补这个文件。

### 8.2 创建公共基础配置 tsconfig.base.json

**你要创建的文件：** 根目录 `tsconfig.base.json`

**复制文章这段进去：**

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "target": "es2018",
    "module": "esnext",
    "baseUrl": ".",
    "sourceMap": false,
    "moduleResolution": "node",
    "allowJs": false,
    "strict": true,
    "noUnusedLocals": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "removeComments": false,
    "rootDir": ".",
    "types": [],
    "paths": {
      "@cobyte-ui/*": ["packages/*"]
    }
  }
}
```

**作用：**

- 统一 TS 的公共编译选项，避免在多个 tsconfig 里重复写。
- `paths` 让你可以用 `@cobyte-ui/...` 这种别名指向 `packages/*`。

### 8.3 创建组件包部分配置 tsconfig.web.json

**你要创建的文件：** 根目录 `tsconfig.web.json`

**复制文章这段进去（去掉多余文案即可）：**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "jsx": "preserve",
    "lib": ["ES2018", "DOM", "DOM.Iterable"],
    "types": ["unplugin-vue-define-options"],
    "skipLibCheck": true
  },
  "include": ["packages"],
  "exclude": [
    "node_modules",
    "**/dist",
    "**/__tests__/**/*",
    "**/gulpfile.ts",
    "**/test-helper",
    "packages/test-utils",
    "**/*.md"
  ]
}
```

**作用：**

- 限定“组件包部分”的 TS 检查范围（只 include `packages`）。
- `composite: true` 允许项目引用与增量构建（生成 `.tsbuildinfo` 等）。

### 8.4 创建 play 部分配置 tsconfig.play.json

**你要创建的文件：** 根目录 `tsconfig.play.json`

**复制文章这段进去：**

```json
{
  "extends": "./tsconfig.web.json",
  "compilerOptions": {
    "allowJs": true,
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": [
    "packages",
    "typings/components.d.ts",
    "typings/env.d.ts",

    "play/main.ts",
    "play/env.d.ts",
    "play/src/**/*"
  ]
}
```

**作用：**

- 限定 play 的 TS 检查范围（play 的入口文件与 src）。

---

## 9. TypeScript 类型检查脚本（tsc / vue-tsc）

文章提到：Element Plus 打包用 ESBuild + Rollup 时，ESBuild 不做 TS 类型检查，所以需要“在打包前先 typecheck”。

### 9.1 纯 TS（构建脚本等）用 tsc

**你要修改的文件：** 根目录 `package.json`

**在 scripts 加：**

```json
{
  "scripts": {
    "typecheck:node": "tsc -p tsconfig.node.json --noEmit"
  }
}
```

**作用：**

- `--noEmit`：只做类型检查，不输出编译产物。
- `-p tsconfig.node.json`：指定一份“构建脚本/Node 侧”的 TS 配置。

> 说明：文章引用了 `tsconfig.node.json`，但你这篇内容里同样没给出它的具体配置，需要你在引入构建脚本目录后补。

### 9.2 含 Vue SFC（.vue）的项目用 vue-tsc

文章给的 scripts 示例：

```json
{
  "scripts": {
    "typecheck:web": "vue-tsc -p tsconfig.web.json --composite false --noEmit",
    "typecheck:play": "vue-tsc -p tsconfig.play.json --composite false --noEmit"
  }
}
```

**作用：**

- `vue-tsc`：支持对 `.vue` 单文件组件做类型检查。
- `--noEmit`：只检查不产出。
- `--composite false`：文章强调在 `vue-tsc` 场景不要开 composite 增量产出。

> 提醒：文章虽然没写安装命令，但要能运行 `vue-tsc`，你需要把它装进开发依赖（否则命令找不到）：
>
> ```bash
> pnpm install vue-tsc -D -w
> ```

---

## 10. 多脚本串行/并行执行（推荐用 npm-run-all）

### 10.1 串行：一个做完再做下一个

```json
{
  "scripts": {
    "runall": "pnpm run typecheck:web && pnpm run typecheck:play && pnpm run typecheck:node && pnpm run typecheck:vitest"
  }
}
```

**作用：**

- `&&`：按顺序执行（前一个失败通常会中断后续）。

### 10.2 并行：同时跑多个脚本

文章举了用 `&` 并行的写法，但在 Windows/PowerShell 下 `&` 语义和 bash 不同，容易踩坑。

更稳妥、跨平台的方式：用 `npm-run-all`（文章也推荐了）。

**在哪执行：** 根目录。

**安装：**

```bash
pnpm install npm-run-all -D -w
```

**然后在根目录 package.json 写：**

```json
{
  "scripts": {
    "typecheck": "run-p typecheck:web typecheck:play typecheck:node typecheck:vitest"
  }
}
```

**作用：**

- `run-p`：并行执行多个 scripts。
- 比手写 `&` 更可控、更跨平台。

---

## 你现在可以怎么跑

- 安装依赖：根目录执行 `pnpm install`
- 启动 play：根目录执行 `pnpm run dev`

---

## 文章里提到但本文未给出完整配置的部分（你后续要补齐）

- `tsconfig.vitest.json`：用于测试部分的 TS 配置
- `tsconfig.node.json`：用于构建脚本（Node 侧）的 TS 配置
- `typecheck:vitest`：文章在组合脚本里提到，但未提供具体定义

如果你希望，我可以在你现有目录结构基础上把这些缺失的 tsconfig 和 scripts 也补齐成一套能运行的最小版本（仍然保持 monorepo 思路）。
