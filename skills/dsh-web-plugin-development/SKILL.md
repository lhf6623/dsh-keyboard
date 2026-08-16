---
name: dsh-web-plugin-development
description: 开发或重构 DeepSeek Harness 的 Web bundle 插件（宿主 lib/index.js + 客户端 lib/client.js，含 slot、settings 服务、事件、esbuild 构建并提交 lib/ 的发布流程）时使用。修改 dsh-vibe 的 src/、build.mjs、cordis.patch.yml、package.json 之前先读这个技能。
---

# 开发 DSH Web Bundle 插件

这是从 DSH 官方文档（develop/basic、develop/basic/publish、develop/basic/config、develop/framework/events、develop/framework/service、develop/cordis-tutorial，以及仓库内 cordis-plugin-development 技能）提炼出的、针对 Web bundle 插件的可执行知识。本仓库（dsh-vibe）就是这类插件的实例。

## 何时用

- 新增/修改 dsh-vibe 的宿主半边（session/event、SSE、settings 注册）或客户端半边（slot、settingsScope、React 组件）。
- 调整构建/发布（build.mjs、package.json 的 dsh 段、cordis.patch.yml）。
- 排查「插件装上了但没生效」「slot 没渲染」「settings 没持久化」这类问题。

## 核心模型：bundle 插件

一个可安装的组合包 = 一份 package.json + 一个 patch 层 + 插件模块。它用 dsh 段声明自己贡献什么：

~~~json
{
  "name": "dsh-vibe",
  "type": "module",
  "main": "lib/index.js",
  "exports": {
    ".": "./lib/index.js",
    "./client": "./lib/client.js",
    "./cordis.patch.yml": "./cordis.patch.yml"
  },
  "files": ["lib", "cordis.patch.yml"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web" }
  }
}
~~~

- dsh.bundle.patch 指向 cordis.patch.yml，它往 Loader 树里插入宿主行，name 必须等于包名：

~~~yaml
- insert:
    - id: vibe
      name: 'dsh-vibe'
~~~

- dsh.client 声明这是 Web 客户端插件；客户端半边由 ./client 导出（lib/client.js），运行时通过 window.__ModuleLoader__.load 注册。

## 项目结构（本仓库约定）

~~~text
├── package.json        # name / dsh / main / exports / files + build 脚本 + devDep esbuild
├── cordis.patch.yml    # 宿主行的 insert 层
├── build.mjs           # esbuild：src -> lib
├── lib/                # 构建产物，随仓库提交（发布用，勿手改）
│   ├── index.js        # 宿主（ESM）
│   └── client.js       # 客户端（ModuleLoader 工厂）
└── src/                # TypeScript/JSX 源码（改这里）
    ├── index.ts        # 宿主
    ├── client.tsx      # 客户端入口
    ├── styles.css      # 全部样式（以 text loader 导入）
    └── ...             # 按职责拆分的模块/组件
~~~

## 宿主半边（lib/index.js ← src/index.ts）

插件是导出 apply 的模块；name 是可选显示元数据：

~~~ts
import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

export const name = 'dsh-vibe'
export default {
  inject: ['webServer'],   // 硬依赖；就绪后 apply 才执行
  apply(ctx: any) { ... }
}
~~~

- 运行时注入（不放进顶层 inject 数组的服务，用 ctx.inject）：

~~~ts
ctx.inject(['settings'], (settingsCtx) => settingsCtx.settings.register(ns, schema))
~~~

- 事件监听（自动清理，无需手动 remove）：

~~~ts
ctx.on('session/event', (session, event) => { if (event.type === 'turn/end') ... })
~~~

- 自定义资源（返回 disposer）：

~~~ts
ctx.effect(() => { ...; return () => { cleanup() } })
~~~

- HTTP 路由（SSE 等长连接也走这里；handler 收 (req, res)）：

~~~ts
ctx.webServer.register({ kind: 'exact', path: '/api/vibe-events', handler: (req, res) => {...} })
~~~

### 会话事件（AI 输出）

turn/*、step/*、assistant/chunk、assistant/message 是持久化会话事件，不是同名 Cordis 事件。观察它们要监听 session/event 并检查 event.type：

- turn/end —— 整轮（含工具调用）结束 =「AI 回答完毕」；
- assistant/message —— 某一步的最终完整消息；
- assistant/chunk —— 流式增量（text-delta / finish / usage 等 chunk.type）。

## 客户端半边（lib/client.js ← src/client.tsx）

客户端是构建出的 CJS 工厂，包在 ModuleLoader 外壳里，require('react') 由运行时注入：

~~~js
window.__ModuleLoader__.load({
  id: 'dsh-vibe',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    /* ...bundled code... */
    return module.exports
  },
})
~~~

- 客户端 inject 声明硬依赖服务，apply(ctx) 里注册 UI：

~~~ts
export const inject = ['slots', 'settingsScope', 'connection', 'remote']
export function apply(ctx: any) {
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'dsh-vibe' }, Overlay,
  ))
}
~~~

- 常用 slot：
  - shell.overlay —— 全窗口悬浮层（键盘 / 火焰画布）。
  - settings.section —— 独立设置页（list；选项 id / order / label）。
  - settings.general.item —— 通用设置里的一行（list；选项 id / order，组件自绘 label）。

## 设置服务（持久化用户偏好）

用户可在 UI 里改的偏好（主题、语言、本插件的 opacity / scale 等）应走 settings 服务，不要用 localStorage：

1. 宿主注册 schema（Schemastery，默认值写在 schema 里）：

~~~ts
const NS = settingsNamespace('dsh-vibe')   // 校验小写 kebab-case，返回原串
const SettingsSchema = z.object({
  enabled: z.boolean().default(true),
  shake: z.union(['off', 'light', 'medium']).default('off'),
  opacity: z.number().min(0.1).max(1).default(0.5),
})
ctx.inject(['settings'], (sctx) => sctx.settings.register(NS, SettingsSchema))
~~~

2. 客户端绑定并读写：

~~~ts
const scope = ctx.settingsScope.bind({ namespace: 'dsh-vibe' })
scope.getSnapshot()          // { status: 'loading' | 'ready', value, revision, writable }
scope.subscribe(listener)    // 订阅变化
scope.set('opacity', 0.8)    // 写一个字段（异步 RPC，按 revision 冲突检测）
~~~

## 构建与发布（方案 2：提交 lib/，无需 allowBuilds）

Git 安装拉的是源码、不跑 build 脚本。所以要么 prepare + 用户 allowBuilds 授权，要么直接把 lib/ 构建产物提交进仓库（本仓库选这个：零授权、零摩擦）。

~~~js
// build.mjs 要点
// 客户端：TSX -> CJS（react 标 external，jsx 用 transform，.css 用 text loader），再包 ModuleLoader 外壳
esbuild.build({ entryPoints: ['src/client.tsx'], format: 'cjs', platform: 'browser', external: ['react'], jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', loader: { '.css': 'text' } })
// 宿主：TS -> ESM（harness 内部包标 external，运行时从 dsh 安装目录解析）
esbuild.build({ entryPoints: ['src/index.ts'], format: 'esm', external: ['@deepseek-ai/schemastery', '@deepseek-ai/dsh-settings'] })
~~~

- react 必须 external：客户端工厂的 require('react') 由运行时注入；esbuild 会生成 __toESM(require("react"), 1)，与 harness 自身获取 React 的方式一致。
- harness 内部包（schemastery / dsh-settings / cordis）始终从 dsh 安装目录解析，所以可以放心 import，但要标 external 别打进产物。

## 改动流程

**本地开发（无需 git 提交）**：
1. 改 src/。
2. 跑 npm run watch（node build.mjs --watch），esbuild 自动重建 lib/。
3. 客户端半边 lib/client.js 由 harness 内置的 dsh-client-hmr 热替换（stat-poll 检测 mtime 变化 → SSE 广播 rebuilt → 客户端 invalidate + 重新加载 bundle），浏览器即时生效。
4. 只有改到宿主半边（src/index.ts，如 session/event、settings schema）时才需要重启 harness；宿主没有内置热替换。

**发布（提交到 GitHub）**：
1. npm run build。
2. node --check lib/index.js && node --check lib/client.js 校验语法。
3. bump package.json 的 version。
4. 提交（含 lib/ 产物）→ dsh plugin --profile web remove dsh-vibe → dsh plugin --profile web add github:lhf6623/dsh-keyboard。

## 关键约定与坑

- 事件命名 namespace/action；waterfall 监听器必须调用 next()，不调用 = 故意短路。
- slot 协议：注册前先确认该 slot 的 kind（single / list / keyed）、scope、选项；settings.general.item 不投影 label，组件要自绘标题。
- effect 自动清理：ctx.on / ctx.effect / 服务注册都会随插件卸载自动撤销，不要手写 removeListener；外部资源用 ctx.effect(() => disposer)。
- session/event 只在 live 时发出，恢复 / 回放的历史事件不会重放（所以「回答完毕」不会在打开历史会话时误触发）。
- 发布包名 ≠ 仓库名是常态（仓库 lhf6623/dsh-keyboard，包名 dsh-vibe），别混。
- 重启服务只杀「监听 3080 的进程」：lsof -ti:3080 -sTCP:LISTEN，不要用 lsof -ti:3080（会把浏览器这类已连接客户端也列进去误杀）。
