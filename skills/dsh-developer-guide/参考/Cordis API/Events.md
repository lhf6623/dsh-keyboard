# Events

官方原文：harness `docs/cordis-api/events.zh.md`（生成文件，签名以原文为准）。harness 事件声明及其分发模式生成到各自所属的子系统页面。

每个上下文都混入了事件分发 API。分发方法的完整签名（`thisArg` 变体见下）：

## 分发方法

| 方法 | 语义 | 返回值 |
| --- | --- | --- |
| `ctx.emit(name, ...args)` | 同步分发，忽略监听器返回值 | void |
| `ctx.parallel(name, ...args)` | 并发运行所有监听器 | 所有监听器 settle 后兑现的 Promise |
| `ctx.serial(name, ...args)` | 依次 await，直到一个提前终止 | 第一个 bail 值（非 null/false/undefined）的 Promise |
| `ctx.bail(name, ...args)` | 同步依次调用，直到一个提前终止 | 第一个 bail 值 |
| `ctx.waterfall(name, ...args)` | 最后一个参数是 `next` continuation；每个监听器包装调用链其余部分，调用 `next()` 执行下一个（最终内置行为），不调用即否决 | 最外层监听器的返回值 |

`DispatchMode = 'emit' | 'parallel' | 'serial' | 'bail' | 'waterfall'`。

**thisArg 变体**：每个分发方法都有 `(thisArg, name, ...args)` 重载——`thisArg` 是 scope carrier（`dsh-scope` 的 `scopeTarget` 构建），过滤器放行无标签监听器 + 主体自身的监听器。这就是 `session/event` 等事件按 agent 作用域过滤分发的机制。

## 监听

```ts
ctx.on(name, listener, options?)     // 归当前 fiber 所有；返回 disposer（调用时若仍注册返回 true）
ctx.once(name, listener, options?)   // 首次调用后自行注销
```

```ts
interface EventOptions {
  /** 插入到同事件既有监听器之前 */
  prepend?: boolean
  /** 无视上下文过滤器检查接收事件 */
  global?: boolean
}
```

- 监听器签名由 `Events` 接口声明合并获得类型（`declare module '@deepseek-ai/cordis' { interface Events { ... } }`）。
- `ctx.on` 属于 effect，随 fiber 卸载自动移除。
- `global: true` 可绕过 carrier 过滤器——挂在 `agent.ctx` 上的监听器想收别的 scope 的事件时才用。
