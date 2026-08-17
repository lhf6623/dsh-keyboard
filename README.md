# dsh-vibe

DeepSeek Harness (DSH) 输入氛围插件：在输入框上方展示一块 87 键 TKL 键盘 + 鼠标并实时高亮按键与鼠标操作，打字时喷火焰粒子、输入框轻震，AI 回答完成时播放提示音并整页轻震。

## 功能

- **键盘可视化**：87 键 TKL 布局（Esc、F1–F12 分三组、方向键倒 T 布局），按物理键 `event.code` 高亮（区分左右 Shift/Alt/Ctrl/Cmd）。
- **鼠标可视化**：左/中/右键与滚轮实时高亮，鼠标与方向键同列并水平居中对齐。
- **内容区水平居中**：键盘居中于「内容区」（已扣除左侧边栏宽度），监听侧边栏显示/隐藏实时重新居中；切换时带平滑过渡动画；首次加载在位置计算完成后才挂载，避免出现左右闪跳。
- **深色模式**：跟随 DSH 主题（`body[data-ds-dark-theme]`）自动切换浅色/深色键帽与鼠标配色。
- **打字火焰效果**：在输入框文字光标处喷出火焰粒子（canvas 粒子系统）。新增、删除、粘贴，以及中文输入（拼音过程 + 上屏）都会触发；系统开启「减弱动态效果」时自动关闭。
- **输入抖动**：每次输入给输入框卡片一个轻微的水平震动反馈，强度分「关 / 轻 / 中 / 强」，默认关；开启「减弱动态效果」时强制关闭。
- **回答完成提示 + 整页抖动**：AI 回答完毕（宿主监听 `session/event` 的 `turn/end`，经 SSE 推送到浏览器）时播放一声短促「叮」提示音，并按**独立的整页抖动强度**（`pageShakeLevel`，不跟随输入抖动）给整页一个轻微震动。
- **设置面板（三组主开关）**：独立「氛围」标签（`settings.section`），三组主开关模式——键盘外观（显示键盘 + 透明度/缩放）、打字反馈（打字火焰 + 输入抖动）、回答反馈（回答后整页抖动 + 强度 + 提示音）；组总开关关闭时整组功能停、子项隐藏，持久化到 `localStorage`。
- **组合键不卡键**：窗口失焦或页面隐藏时自动清空所有按下状态，并用 `getModifierState` 校准修饰键，避免 Ctrl/Cmd/Alt/Shift 卡在按下状态。
- **配置式**：宿主导出 `Config` schema（见「配置」），部署者在 `cordis.yml` 的 `config` 块配置；浏览器只读解析值（白名单暴露时走系统 settings，未暴露时读默认值）。

## 安装

```bash
dsh plugin --profile web add github:lhf6623/dsh-keyboard
```

## 配置

配置式（见 cordis-tutorial/05-config）：宿主导出 `Config` 接口与同名 Schemastery schema（`src/index.ts`），默认值写在 schema 里；部署者在 `cordis.yml` 的 entry `config` 块覆盖（如 profile 的 `cordis.patch.yml`）。结构（schema 默认值）：

```json
{
  "enabled": true,        // 键盘外观组总开关
  "opacity": 0.5,         // 键盘透明度
  "scale": 1,             // 键盘缩放
  "feedback": true,       // 打字反馈组总开关
  "flame": true,          // 打字火焰
  "shake": "off",         // 输入抖动（off/light/medium/strong）
  "response": true,       // 回答反馈组总开关
  "pageShake": true,      // 回答后整页抖动
  "pageShakeLevel": "off",// 整页抖动强度（独立于输入抖动）
  "sound": true           // 回答提示音
}
```

宿主按官方路径注册设置：`installSettingsSection(ctx, ns, Config, config, …)`（cookbook/adding-a-settings-card），浏览器经 `settingsScope.bind` 读取，并在设置面板提供独立「氛围」标签（`settings.section`，显示不依赖白名单）供用户修改。**持久化**：设置存浏览器 `localStorage`（键 `dsh-vibe.config`），发布后依然有效；DSH 的浏览器设置白名单（api-proxy 的 `WEB_SETTINGS_NAMESPACES`）硬编码不含第三方 namespace，白名单暴露时（scope `ready`）优先读系统 settings 并回写 localStorage，未暴露时 localStorage 是唯一存储。宿主侧的 cordis.yml 配置（`Config` schema）始终生效，作为 schema 默认之上的组装层。

## 开发

源码在 `src/`（TypeScript + JSX），用 **Vite**（宿主 + 客户端）+ **UnoCSS**（原子 CSS，`vibe-` 前缀）构建到 `lib/`；构建产物 `lib/` 随仓库提交，因此 `dsh plugin add github:...` 安装时**无需运行构建脚本、也无需 allowBuilds 授权**。

```text
src/
├── index.ts            # 宿主：Config schema + session/event + SSE
├── client.tsx          # 客户端入口：apply / inject / SSE / CSS 注入
├── settings/           # 设置（配置式 + 设置面板）
│   ├── config.ts       # 配置类型 / settingsScope 绑定 / localStorage 持久化
│   └── settings.tsx    # 「氛围」设置面板（settings.section）
├── ui/                 # 视觉与交互
│   ├── overlay.tsx     # 悬浮层主组件（键盘/鼠标渲染、事件、位置测量）
│   ├── keyboard.tsx    # 键盘 / 鼠标 UI 组件
│   ├── layout.ts       # 键盘布局数据
│   └── caret.ts        # 光标位置测量
├── fx/                 # 特效
│   ├── flame.ts        # 火焰粒子
│   ├── shake.ts        # 输入抖动 + 整页抖动
│   ├── audio.ts        # 回答提示音
│   └── motion.ts       # reducedMotion()
└── shims.d.ts          # 类型占位
```

```bash
npm install          # 安装 devDependencies（vite / unocss / react / types）
npm run build        # 构建 lib/index.js（宿主）+ lib/client.js（客户端）
npm run build:host   # 只构建宿主（vite.host.config.ts）
npm run build:client # 只构建客户端（vite.client.config.ts）
npm run watch        # 监听 src/ 自动重建客户端（配合 harness 内置 HMR）
```

构建全走 **Vite**：`vite.host.config.ts`（宿主 ESM lib mode，harness 内部包 external）+ `vite.client.config.ts`（客户端 CJS lib mode）。UnoCSS 与 ModuleLoader 包装作为 Vite 插件（`vite.shared.ts`）：扫描 src/ 提取 `vibe-*` 原子类生成 CSS 内联进客户端，浏览器运行时注入 `<style>`。

**UnoCSS**：全部样式都是原子类（utility），不再有手写 CSS 文件。原子类统一带 `vibe-` 前缀避免与 DSH 类名冲突；键盘/鼠标/火焰等组件样式同样拆成原子类写在组件 `className` 里（如 `vibe-h-[30px]`、`vibe-bg-[rgba(88,150,255,0.18)]`），深色模式用自定义变体 `dsh-dark:`（映射到 `body[data-ds-dark-theme]`），窄屏隐藏用 `[@media(max-width:920px)]:` 变体，减弱动效用 `motion-reduce:` 变体。构建时由 Vite 插件（`vite.shared.ts`）扫描 `src/` 生成全部 CSS。

**本地开发**（无需 git 提交）：改 `src/` → 跑 `npm run watch`，自动重建 `lib/`；客户端半边 `lib/client.js` 由 harness 内置的 `dsh-client-hmr` 热替换，浏览器即时生效。只有改到**宿主半边**（`lib/index.js`，如 session/event、SSE 路由）时才需要重启 harness。

**发布**：`npm run build` → bump `package.json` 的 `version` → 提交（含 `lib/`）→ `dsh plugin remove dsh-vibe` + `dsh plugin add github:lhf6623/dsh-keyboard`。

## 版本记录

- 未发布（自 0.1.35 以来，待发布时统一 bump）：
  - 配置式：宿主导出 `Config` schema（cordis-tutorial/05-config），cordis.yml entry `config` 块配置，`apply(ctx, config)` 接收；按官方 cookbook/adding-a-settings-card 用 `installSettingsSection` 注册 settings namespace（base = 组合配置）
  - 设置面板：独立「氛围」标签（`settings.section`，显示不依赖白名单），三组主开关模式（键盘外观/打字反馈/回答反馈），组总开关 `feedback`/`response` 控制整组功能，回答后整页抖动独立强度 `pageShakeLevel`
  - 持久化：localStorage（键 `dsh-vibe.config`）；白名单暴露时优先读系统 settings 并回写
  - 结构：src/ 重组为 `settings/` `ui/` `fx/` 分类目录
  - 构建：统一 Vite（`vite.host.config.ts` + `vite.client.config.ts` + `vite.shared.ts` 插件），移除 `build.mjs` 与 esbuild 直接依赖，`tsc --noEmit` 类型检查通过
  - 修复：键盘/overlay 位置监听增强（滚动/内容增长/布局重排跟随输入框）、特效受组开关控制
- 0.1.35 全部样式改用 UnoCSS 原子类（删除 styles.css、新增 dsh-dark 深色变体、键盘/鼠标/分段按钮原子化）；设置持久化回退浏览器 localStorage（DSH settings 服务的配置客户端白名单不含第三方 namespace，写入被 settings-not-exposed 拒绝）
- 0.1.34 设置迁移到 DSH settings 服务（宿主 schema + 客户端 settingsScope）
- 0.1.33 重构：TypeScript 源码拆分 + esbuild 构建，扁平化 src/ 目录
- 0.1.32 TypeScript 源码 + esbuild 构建，提交 lib/ 产物
- 0.1.28 更名为 dsh-vibe
- 0.1.27 新增回答完成提示音 + 整页抖动（session/event + SSE）
- 0.1.26 新增输入抖动（关 / 轻 / 中）
- 0.1.25 更新 package 描述
- 0.1.24 键盘改为位置计算完成后才挂载，消除初始化左右滑动
- 0.1.23 初始化隐藏优化；中文输入过程喷火
- 0.1.22 回退 / 删除也喷火
- 0.1.21 新增打字火焰效果 + 火焰开关
- 0.1.20 新增设置面板（通用设置 → 外观）：显示 / 透明度 / 缩放
- 0.1.19 深色模式适配
- 0.1.18 组合键卡键修复
- 0.1.17 侧边栏切换时水平居中平移动画
- 0.1.16 侧边栏切换重新居中；鼠标与方向键居中对齐
- 0.1.15 内容区水平居中（扣除侧边栏宽度）
