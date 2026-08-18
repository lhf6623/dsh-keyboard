# Context

官方原文：harness `docs/cordis-api/context.zh.md`（生成文件，签名以原文为准）。

上下文是 Cordis 的核心对象：所有服务、事件和生命周期 API 都通过 `ctx` 访问。它是一个**代理**——普通属性读取经服务解析器进行；`extend()`、`isolate()`、`intercept()` 创建有作用域的子上下文，且不修改父上下文。

## 派生子上下文

- `ctx.extend(meta?)` —— 在当前作用域之上创建带额外元数据的子上下文；原型继承父上下文全部属性，`meta` 自有属性遮蔽同名继承属性。
- `ctx.isolate(name, label?)` —— 为服务 `name` 创建独立作用域的子上下文；其下对该服务的读写按新 label 解析，不影响父作用域；传相同 `label` 的两次调用加入同一作用域。
- `ctx.intercept(name, config)` —— 为其下启动的插件添加服务专属拦截配置；加载时 `config` 合并进服务解析配置（祖先条目在前）。

## 环境句柄

- `ctx.root` —— 应用根上下文（@experimental）。
- `ctx.baseUrl` —— 解析相对插件/模块说明符的基础 URL。
- `ctx.events` —— 事件总线；方法混入 `ctx`（`ctx.on`、`ctx.emit`…）。
- `ctx.logger` —— 日志服务；`ctx.logger(name)` 取具名 logger。
- `ctx.reflect` —— 上下文代理背后的反射层（`ctx.get`、`ctx.provide`…）。
- `ctx.registry` —— 插件注册表；方法混入 `ctx`（`ctx.plugin`、`ctx.inject`）。

## 服务存储与混入（低层 API，日常用 Service 基类即可）

- `ctx.get(name, strict?)` —— 无需 inject 要求直接读服务；`strict: true`（默认）只返回提供方 fiber 仍活跃的实现；未提供时 undefined。
- `ctx.set(name, value)` —— 覆盖已提供服务的值；只有提供该服务的 fiber 可调用，设置未提供名称会 throw。
- `ctx.provide(name, value)` —— 注册归当前 fiber 所有的服务实现，返回 disposer；同名已在作用域提供或声明为 accessor 时 throw。
- `ctx.accessor(name, { get, set? })` —— 定义 get/set 钩子支持的计算型属性；fiber 卸载时移除。
- `ctx.mixin(name, mixins)` —— 把服务的指定成员直接暴露在 ctx 上（如 `ctx.on` 转发到 `ctx.events.on`，方法绑定到服务）；fiber 卸载时移除。

## 静态成员

`Context.effect` / `Context.filter`（监听器过滤器，每次分发时查询——scope carrier 机制）/ `Context.isolate` / `Context.intercept` 是 symbol 键；`Context.is(value)` 跨 realm、跨多份 cordis 副本判断是否为 Cordis 上下文（以全局 symbol 为键，非 instanceof）。

派生子上下文（extend/isolate/intercept）是 `dsh-scope` 的 scope 机制与 `ctx.<service>` 隔离的基础；事件分发的 thisArg 变体见 [Events](Events.md)。
