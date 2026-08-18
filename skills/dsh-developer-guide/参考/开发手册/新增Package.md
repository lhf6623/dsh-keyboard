# 新增 Package

官方原文：harness `docs/cookbook/adding-a-package.zh.md`——它是 **harness monorepo 内部** `@deepseek-ai/dsh-<name>` 包的逐文件清单。第三方 bundle 插件的打包见 开发/基础 的[打包与安装插件](../../开发/基础/打包与安装插件.md)；本页提炼两边都适用的部分。

## 包骨架（monorepo 内）

```
packages/<group>/<pkg>/
  package.json     # 复制模板，改 name/description/deps
  tsconfig.json    # extends 根 base；references 每个 workspace 依赖 + vendor/cordis
  src/index.ts     # service 默认导出或插件（name/inject/apply/Config）
  README.md        # 服务 API、事件、扩展点、设计说明 + Model Experience 段
```

分组是纯容器（core、llm、bash、compact、subagent、todo、session-persistence、ui、util、support），包位于其下一层。

package.json 不变式（monorepo 由 constraints 强制）：`private: true`、version 与根一致、`type: module`、`main: lib/index.js`、`types: lib/types/index.d.ts`、`exports["."]` 的 types/default、`@deepseek-ai/cordis` 同时在 peer + devDependencies（相同范围）、每个 dsh peer 都在 devDependencies 镜像、`@deepseek-ai/schemastery` 放 **dependencies**（运行时校验器）、`files` 精确列出 lib 产物不发布 src/声明映射/map。

包内相对导入在源码中用显式 `.ts` 后缀（编译器输出重写为 `.js`，声明文件保留 `.ts`）。

客户端插件包另加：extends `tsconfig.base.client.json`、package.json 声明 `dsh.client`、导出 `./client`、调用共享 tsdown preset。

## 命名角色（对第三方包同样适用）

| 词 | 适用条件 |
| --- | --- |
| Controller | 接受命令/用户意图并改变既有领域状态或展示状态 |
| Store | 拥有一组数据，主要提供 CRUD/snapshot/subscription |
| Directory | 暴露供发现/选择的条目及元数据 |
| Presenter | 把领域值/工具参数**纯**转换为渲染意图 |
| Registry | 拥有一组动态具名注册 + 查询/重复项/优先级规则 + 生命周期 |
| Runtime | 运行实时工作，跨调用拥有分派/取消/协调/操作生命周期 |
| Resolver | 根据输入计算或定位答案，不拥有答案生命周期 |
| Binder | 把已声明接口绑定到调用方 context/生命周期，返回绑定值 |
| Engine | 实现领域算法或有状态执行模型 |
| Policy | 决定允许/选择/限制/观察什么（不执行机制） |
| Executor | 在一项能力中运行明确请求或已解析 spec |
| Gateway | 适配进程/网络/RPC/API 边界 |
| Provider | 提供能力定义的实现（多实现加机制/厂商限定词） |
| Backend | 在已定义接口后实现可替换的持久化/传输/执行 |
| Handle | 引用实时资源并控制/观察它 |
| Config | 拥有已解析配置值或边界严格的配置记录 |
| Service | 无法用更精确角色诚实描述时的内聚领域服务（不是「因为继承了 Cordis Service」） |

名称必须描述当前稳定职责，不用首个实现/未来扩展/Cordis 基类命名；一个 engine/runtime/store 用单数 ctx key，registry 或多成员服务用复数 key；host 与 client 不得复用同一 ctx key（声明合并会同时看到两种类型）。

## 验证（monorepo）

```sh
pnpm install && pnpm run doc-sync
pnpm run constraints && pnpm run typecheck && pnpm run lint
pnpm run build && pnpm run hygiene
```

## 下一步

- [新增Tool](新增Tool.md) —— 工具注册约定
- [新增LLMAdapter](新增LLMAdapter.md) —— LLM 提供方接入
- [新增设置卡片](新增设置卡片.md) —— settings 接入
