# Plugin Registry

官方原文：harness `docs/cordis-api/registry.zh.md`（生成文件，签名以原文为准）。

插件加载与依赖注入。

## ctx.inject(deps, callback)

请求的服务可用后运行回调——`ctx.plugin({ inject, apply: callback })` 的简写：**每当某个必需服务发生变化时，回调被卸载并重跑**。`deps` 是服务名数组，或 name → intercept config 的映射。返回 fiber，await 它会在加载完成后结束。

## ctx.plugin(plugin, ...args)

在当前上下文加载插件。`plugin` 可以是函数、类或 `{ apply }` 对象；`args` 是插件配置，按它的 `Config` schema 校验。返回 fiber（await 会在加载完成后结算；配置/启动错误时 reject）。

## Plugin 类型

```ts
type Plugin<T> = Plugin.Function<T> | Plugin.Constructor<T> | Plugin.Object<T>;

namespace Plugin {
  /** 插件入口共有的元数据 */
  interface Base<T> {
    /** fiber 诊断与 logger 名用的显示名 */
    name?: string;
    /** 插件启动前校验 config 的 standard-schema 验证器 */
    Config?: StandardSchemaV1<any, T>;
    /** 必需服务；全部可用时才加载 */
    inject?: Inject;
    /** 插件提供的服务名（Service 与 loader 读取） */
    provide?: string | string[];
    /** 插件声明消费其拦截配置的服务名 */
    intercept?: Dict<boolean>;
  }
  interface Function<T> extends Base<T> {
    (ctx: Context, config: T): any;
  }
  interface Constructor<T> extends Base<T> {
    new (ctx: Context, config: T): any;
  }
  interface Object<T> extends Base<T> {
    apply(ctx: Context, config: T): any;
  }

  /** 共享可变注册表记录：每个 ctx.plugin() 调用的所有 fiber 属于一个 runtime */
  interface Runtime {
    name?: string;
    fibers: DisposableList<Fiber>; // 此插件的每个存活 fiber
    callback: globalThis.Function; // 所有 fiber 共享的可执行入口（注册表身份键）
    Config?: StandardSchemaV1;
  }
}
```

## Inject 类型

```ts
type Inject<M> = (keyof M)[] | { [K in keyof M]?: M[K] };
```

- 数组形式：请求服务，不带拦截配置。
- 对象形式：每个服务名映射到插件上下文的可选拦截配置。
- `Inject.resolve(inject, result?)` 把数组/对象/类继承的 inject 元数据规范化成平铺 map（服务名 → 拦截配置或 null）。

## 与日常开发的关系

- 顶层 `inject` 声明（数组）→ 硬依赖；对象形式 + `ctx.intercept` 是服务配置拦截的配套机制，插件开发很少直接用。
- 排查 fiber 状态见 [Fiber](Fiber.md)；注册表枚举 `ctx.registry.values()` 里每个 runtime 的 `fibers` 是 PENDING 诊断的入口。
