# LLM 适配器

官方原文：harness `docs/user/develop/practice/llm-adapter.zh.md`；完整实现参考 `packages/llm/llm-deepseek/`（OpenAI 兼容格式）与 `packages/llm/llm-pi-ai/`（不同 API 格式）。

## 概述

LLM 适配器是一个继承 `LlmAdapter` 并实现 `stream()` 方法的类：把 Harness 的提供方无关请求（`GenerateOptions`）转换为具体提供方的 API 调用，再把响应转换回 Harness 的 `StreamChunk` 分片。

## 最小实现

```ts
import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";
import {
  LlmAdapter,
  type GenerateOptions,
  type StreamChunk,
} from "@deepseek-ai/dsh-llm";

class MyAdapter extends LlmAdapter {
  constructor(private readonly apiKey: string) {
    super();
  }

  async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    // 1. 把 options.messages 转成提供方格式
    // 2. 调流式 API
    // 3. 把响应转成 StreamChunk 序列
  }
}

export interface Config {
  apiKey: string;
  providers: string[];
}

export const Config: Schema<Config> = Schema.object({
  apiKey: Schema.string().required(),
  providers: Schema.array(Schema.string()).required(),
});

export const name = "my-llm-adapter";
export const inject = ["llm"];

export function apply(ctx: Context, config: Config) {
  ctx.llm.registerAdapter(config.providers, new MyAdapter(config.apiKey));
}
```

## StreamChunk 协议

```ts
async function* exampleChunks(): AsyncIterable<StreamChunk> {
  yield { type: "block-start", index: 0, blockType: "text" };
  yield { type: "text-delta", index: 0, text: "Hello" };
  yield { type: "text-delta", index: 0, text: " world" };
  yield {
    type: "block-end",
    index: 0,
    block: { type: "text", text: "Hello world" },
  };

  // 工具调用块
  yield { type: "block-start", index: 1, blockType: "tool-call" };
  yield {
    type: "tool-call-delta",
    index: 1,
    id: CallId("call-123"),
    name: "bash",
    argumentsDelta: '{"command":"ls"}',
  };
  yield {
    type: "block-end",
    index: 1,
    block: {
      type: "tool-call",
      id: CallId("call-123"),
      name: "bash",
      arguments: '{"command":"ls"}',
    },
  };

  yield { type: "usage", usage: { inputTokens: 100, outputTokens: 50 } };
  yield { type: "finish", reason: { kind: "stop" } }; // { kind: 'tool-calls' } = 请求工具执行
}
```

关键规则：

- 每个 `block-start` 必须有对应的 `block-end`；`index` 从 0 递增标识块顺序。
- `tool-call-delta` 的 `argumentsDelta` 是原始 JSON 文本增量（可一次完整生成或分多个分片）。
- **`finish` 必须是最后一个分片**；`usage` 必须在 `finish` 之前。

## GenerateOptions 与模型解析

- `stream()` 收到的 `GenerateOptions` 含模型、适配器拥有的推理强度 ID、对话历史、系统提示词、工具 schema、生成参数、停止序列、中止信号；完整字段以 `@deepseek-ai/dsh-llm` 导出的类型为准。
- **无法支持某字段时抛带稳定 code 的 `LlmError`，不得静默丢弃。**
- 覆写 `resolveModel(provider, model, signal?)`：一次查询返回确切的提供方/模型身份与可选的 `context`/`reasoning` 元数据；异步查询必须响应 signal 以便取消。服务会校验聚合结果，在 `stream()` 前拒绝显式指定但不受支持的推理强度。
- 适配器能向选择器公布模型选项时覆写 `listModels()`。

## 在 cordis.yml 中使用

```yaml
- id: my-llm
  name: "./src/my-llm-adapter.ts"
  config:
    apiKey: !!js process.env.MY_API_KEY
    providers:
      - my-provider

- id: agent-loop
  name: "@deepseek-ai/dsh-agent-loop"
  config:
    agents:
      - id: main
        provider: my-provider
        model: my-model-v1
```

## 错误处理

- 传输与协议故障用带稳定 code 的 `LlmError` 抛出；agent loop 会保留错误与 code 用于诊断和策略处理，**不要依赖普通 `Error` 被自动转换**。
- 每个提供方 HTTP 请求必须合并 `attributionHeaders()`，并传递 `options.signal`：

```ts
import { attributionHeaders, LlmAdapter, LlmError } from '@deepseek-ai/dsh-llm'

async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
  const response = await fetch(this.endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...attributionHeaders() },
    body: JSON.stringify({ model: options.model, messages: options.messages }),
    ...options.signal ? { signal: options.signal } : {},
  })
  if (!response.ok) {
    throw new LlmError(`Provider API error: ${response.status}`, 'PROVIDER_HTTP_ERROR')
  }
  yield { type: 'finish', reason: { kind: 'stop' } }
}
```
