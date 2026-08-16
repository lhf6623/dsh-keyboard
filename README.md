# dsh-vibe

DeepSeek Harness (DSH) 输入氛围插件：在输入框上方展示一块 87 键 TKL 键盘 + 鼠标并实时高亮按键与鼠标操作，打字时喷火焰粒子、输入框轻震，AI 回答完成时播放提示音并整页轻震。

## 功能

- **键盘可视化**：87 键 TKL 布局（Esc、F1–F12 分三组、方向键倒 T 布局），按物理键 `event.code` 高亮（区分左右 Shift/Alt/Ctrl/Cmd）。
- **鼠标可视化**：左/中/右键与滚轮实时高亮，鼠标与方向键同列并水平居中对齐。
- **内容区水平居中**：键盘居中于「内容区」（已扣除左侧边栏宽度），监听侧边栏显示/隐藏实时重新居中；切换时带平滑过渡动画；首次加载在位置计算完成后才挂载，避免出现左右闪跳。
- **深色模式**：跟随 DSH 主题（`body[data-ds-dark-theme]`）自动切换浅色/深色键帽与鼠标配色。
- **打字火焰效果**：在输入框文字光标处喷出火焰粒子（canvas 粒子系统）。新增、删除、粘贴，以及中文输入（拼音过程 + 上屏）都会触发；系统开启「减弱动态效果」时自动关闭。
- **输入抖动**：每次输入给输入框卡片一个轻微的水平震动反馈，强度分「关 / 轻 / 中」，默认关；开启「减弱动态效果」时强制关闭。
- **回答完成提示 + 整页抖动**：AI 回答完毕（宿主监听 `session/event` 的 `turn/end`，经 SSE 推送到浏览器）时播放一声短促「叮」提示音，并按「抖动」档位给整页一个轻微震动；提示音可独立开关。
- **组合键不卡键**：窗口失焦或页面隐藏时自动清空所有按下状态，并用 `getModifierState` 校准修饰键，避免 Ctrl/Cmd/Alt/Shift 卡在按下状态。
- **设置面板**：独立设置分区「氛围」（设置面板里一个独立的「氛围」标签页），分三组：
  - 键盘外观：显示键盘 / 键盘透明度（10%–100%）/ 键盘缩放（60%–150%）
  - 打字反馈：打字火焰 / 输入抖动（关 / 轻 / 中）
  - 回答反馈：回答提示音

## 安装

```bash
dsh plugin --profile web add github:lhf6623/dsh-keyboard
```

## 配置

设置持久化到浏览器 `localStorage`（键 `dsh-vibe.config`，兼容旧键 `dsh-keyboard.config`）。这些是纯客户端 UI 偏好；不走 DSH `settings` 服务——它的配置客户端白名单不含第三方插件 namespace，浏览器写入会被 `settings-not-exposed` 拒绝（插件自声明机制在 DSH 里还是 deferred work）。结构：

```json
{ "enabled": true, "flame": true, "shake": "off", "sound": true, "opacity": 0.5, "scale": 1 }
```

也可直接在「设置 → 氛围」中调整，实时生效并持久化。

## 开发

源码在 `src/`（TypeScript + JSX），用 **Vite**（客户端）+ **UnoCSS**（原子 CSS，`vibe-` 前缀）+ esbuild（宿主）构建到 `lib/`；构建产物 `lib/` 随仓库提交，因此 `dsh plugin add github:...` 安装时**无需运行构建脚本、也无需 allowBuilds 授权**。

```text
src/
├── index.ts        # 宿主：session/event + SSE
├── client.tsx      # 客户端入口：apply / inject / SSE / CSS 注入
├── config.ts       # 设置存储（localStorage）+ 类型
├── layout.ts       # 键盘布局
├── keyboard.tsx    # 键盘 / 鼠标组件
├── overlay.tsx     # 悬浮层组件
├── settings.tsx    # 设置面板组件
├── caret.ts        # 光标位置测量
├── motion.ts       # reducedMotion()
├── flame.ts        # 火焰粒子
├── shake.ts        # 输入抖动 + 整页抖动
└── audio.ts        # 回答提示音
```

```bash
npm install          # 安装 devDependencies（vite / unocss / esbuild / react / types）
npm run build        # 一次性构建 lib/index.js + lib/client.js
npm run watch        # 监听 src/，改动自动重建（配合 harness 内置 HMR）
```

**UnoCSS**：全部样式都是原子类（utility），不再有手写 CSS 文件。原子类统一带 `vibe-` 前缀避免与 DSH 类名冲突；键盘/鼠标/火焰等组件样式同样拆成原子类写在组件 `className` 里（如 `vibe-h-[30px]`、`vibe-bg-[rgba(88,150,255,0.18)]`），深色模式用自定义变体 `dsh-dark:`（映射到 `body[data-ds-dark-theme]`），窄屏隐藏用 `[@media(max-width:920px)]:` 变体，减弱动效用 `motion-reduce:` 变体。构建时由 `build.mjs` 用 `loadConfig` 加载 `uno.config.ts` 并扫描 `src/` 生成全部 CSS。

**本地开发**（无需 git 提交）：改 `src/` → 跑 `npm run watch`，自动重建 `lib/`；客户端半边 `lib/client.js` 由 harness 内置的 `dsh-client-hmr` 热替换，浏览器即时生效。只有改到**宿主半边**（`lib/index.js`，如 session/event、SSE 路由）时才需要重启 harness。

**发布**：`npm run build` → bump `package.json` 的 `version` → 提交（含 `lib/`）→ `dsh plugin remove dsh-vibe` + `dsh plugin add github:lhf6623/dsh-keyboard`。

## 版本记录

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
