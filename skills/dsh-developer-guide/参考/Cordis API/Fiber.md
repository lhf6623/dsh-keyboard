# Fiber

官方原文：harness `docs/cordis-api/fiber.zh.md`（生成文件，签名以原文为准）。

fiber 是一个已加载的插件实例，包含生命周期状态、经过校验的配置和已注册的作用。`ctx.fiber` 是当前 fiber，`ctx.effect()` 委托给它。

## ctx.effect(execute, label?)

- `execute` **立即运行**；产生的 disposer 被收集，在返回的 disposer 被调用或 fiber 卸载时按**注册逆序**运行（先发生者为准）；重复调用 disposer 是 no-op。
- fiber 已 dispose 时抛 `CordisError('INACTIVE_EFFECT')`；`execute` 返回形状无效时抛 `TypeError`。
- `label` 显示在 `getEffects()` 诊断树里（如 `ctx.on("event")`、`ctx.provide("name")`）。

## Fiber 类（`ctx.plugin()` 返回的句柄）

| 成员 | 说明 |
| --- | --- |
| `fiber.uid` | 注册表内唯一 id；根 fiber 为 0，dispose 后 null |
| `fiber.ctx` | 此插件运行的上下文（扩展自父上下文） |
| `fiber.config` | 校验过的插件配置（`update()` 更新） |
| `fiber.state` | 当前生命周期状态；转换发出 `internal/status` |
| `fiber.store` | 加载期间所需服务实现快照；否则 undefined |
| `fiber.inertia` | 进行中的加载/卸载转换 Promise |
| `fiber.name` | 插件显示名，继承自最近具名祖先，否则 'root' |
| `fiber.dispose` | 卸载插件，清理完成后结算 |
| `fiber.assertActive()` | 已 dispose 则抛 `CordisError('INACTIVE_EFFECT')` |
| `fiber.getEffects()` | 每个带标签活动作用的 `EffectMeta` 树 |
| `fiber.await()` | 等当前生命周期工作完成并重抛启动错误 |
| `fiber.restart()` | dispose 并立即以当前配置重载 |
| `fiber.update(config, noSave?)` | 校验新配置 → 先跑 `internal/update` waterfall（更新钩子/HMR 可否决或取代重启）→ 重启插件 |

## 相关类型

- `Effect<T>` = 单个 disposer 函数 / 兑现为 disposer 的 promise / 产出多个 disposer 的（可能异步）可迭代对象——生成器作用在每个 disposer 产生时即注册。
- `Disposable<T> = () => T`（可为异步，卸载会等待）。
- `EffectMeta { label, children }` —— 诊断用的嵌套作用标签树。
- `CordisError` —— 带稳定机器可读 code 的框架错误（当前码：`INACTIVE_EFFECT`）。
- `ValidationError` —— 插件配置未通过 standard-schema 校验时抛出（聚合各 issue 一行一条消息）。

## 状态机

```
PENDING → LOADING → ACTIVE
                 ↘ FAILED
ACTIVE → UNLOADING → DISPOSED
```

诊断入口：遍历 `ctx.registry.values()` 里每个 runtime 的 `fibers`，找 `state === FiberState.PENDING`（依赖的服务缺失 = 插件静默不启动的常见原因）。
