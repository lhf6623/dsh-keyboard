# Service

官方原文：harness `docs/cordis-api/service.zh.md`（生成文件，签名以原文为准）。

上下文服务的基类。以插件形式加载的子类会把自身注册为 `ctx.<name>`——子类在构造函数中调用 `super(ctx, name)`，服务**立即注册**并随所属 fiber 自动移除。

```ts
import { Service, type Context } from "@deepseek-ai/cordis";

declare module "@deepseek-ai/cordis" {
  interface Context {
    myCap: MyCapService;
  }
}

export default class MyCapService extends Service {
  constructor(ctx: Context) {
    super(ctx, "myCap");
  }
}
```

## 实例成员

- `service.name` —— 实例注册用的服务名称。

## 静态 symbol 键

| symbol                  | 用途                                      |
| ----------------------- | ----------------------------------------- |
| `Service.init`          | 构造完成后运行的实例方法（类插件）        |
| `Service.check`         | 传给 `ctx.provide()` 的可用性谓词         |
| `Service.config`        | 虚设拦截配置类型参数                      |
| `Service.invoke`        | 使服务可调用的调用体（如 `ctx.logger()`） |
| `Service.extend`        | 派生扩展服务实例的辅助方法                |
| `Service.tracker`       | 上下文追踪用的跟踪器元数据                |
| `Service.resolveConfig` | 拦截配置解析辅助方法                      |

## 使用场景对照

| 需求               | 做法                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 向其他插件公开能力 | `Service` 子类 + `super(ctx, name)` + 声明合并（见 开发/框架能力 的[服务与依赖](../../开发/框架能力/服务与依赖.md)）                |
| 只是消费能力       | 函数/对象插件 + `inject`，不需要 Service                                                                                            |
| 提供可替换能力     | Service Definition 用**抽象** Service 类，Provider 用具体子类（见 开发/实战 的[能力的三层拆分](../../开发/实战/能力的三层拆分.md)） |
| 低层手工控制注册   | `ctx.provide(name, value)` / `ctx.set`（见 [Context](Context.md)）                                                                  |
