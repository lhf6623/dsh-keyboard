# 新增 LLM Adapter

官方原文：harness `docs/cookbook/adding-an-llm-adapter.zh.md`。参考实现：`packages/llm/llm-deepseek`（直接 HTTP + SSE 分帧）与 `packages/llm/llm-pi-ai`（封装 LLM 库）。动手版教程见 开发/实战 的 [LLM适配器](../../开发/实战/LLM适配器.md)；本页是协议义务清单。

## 基本形态

```ts
class MyAdapter extends LlmAdapter {
  async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> { /* ... */ }
}

export const name = 'llm-myprovider'
export const inject = ['llm']
export const Config: z<Config> = z.object({ apiKey: z.string(), /* ... */ })

export function apply(ctx: Context, config: Config) {
  ctx.llm.registerAdapter(['my-provider'], new MyAdapter(/* ... */))
}
```

- 注册基于副作用，可安全 HMR；**每个提供方路由只对应一个适配器**，重复注册抛异常，多路由注册要么全成功要么全失败。
- `options.provider` 选择适配器；`options.model` 是提供方模型 ID——动态模型目录适配器无需重新配置生命周期即可提供新模型。
- 密钥走 Cordis 原生方式：schemastery Config + `!!js process.env.MY_KEY`；**切勿在代码里读自行约定的密钥文件**。

## 协议义务

- **usage 在 finish 之前**；finish 之后不再发任何内容。稳健做法：缓冲 finish/usage 直到提供方流结束标记再统一 flush。
- 工具调用的 `arguments` 全程原始 JSON 字符串，流式增量用 `argumentsDelta`；提供方返回已解析对象时在 `block-end` 重新 stringify。
- 按首次出现顺序分配块 `index`，同一块的 delta 复用该 index。
- 错误只有两条合法路径：从 `stream()` **抛出**（传输/协议故障，用带稳定 code 的 `LlmError`）或以 `finish {kind: 'error' | 'aborted'}` 结束流（提供方带内故障）。消费方两者都处理。
- 遵守 `options.signal`（传给 fetch 或 SDK）。
- 提供方无法支持的字段（如不支持 stop sequences 却收到 stop 列表）：抛 `LlmError(..., 'UNSUPPORTED')`，**不得静默丢弃**。
- 提供方后续调用需要响应 ID/签名等原生元数据时，把最小无损 JSON 投影作为 `finish.replayState` 发出，重建历史时验证；状态缺失时切勿仅凭提供方/模型名推断原生回放。

## 模型解析与推理强度

- 实现 `resolveModel()`：返回提供方/模型身份 + 可选 `context`/`reasoning` 字段；`defaultEffort` 仅在存在配置指定默认值时声明；遵守解析时传入的可选 `AbortSignal`。
- 推理强度是适配器映射到提供方请求的**有序不透明 ID**；保留适配器给出的权威可选列表（含 `off`），不得暴露最终协议值的具体拼写、不得自动调整不支持的值。

## 实现结构

协议格式（wire format）类型、请求序列化、传输解析、分片转换、适配器类各司其职（`llm-deepseek` 是参考布局）。
