# 新增 Tool

官方原文：harness `docs/cookbook/adding-a-tool.zh.md`——面向模型的工具必须满足的约定均以该文为准。按步骤构建第一个工具见 开发/基础 的[开发一个工具](../../开发/基础/开发一个工具.md)；`packages/shell/tool-bash` 是生产级三包示例。

## 最小形态

```ts
import type { Context } from "@deepseek-ai/cordis";
import { defineTool } from "@deepseek-ai/dsh-tools";

export const name = "my-tool";
export const inject = ["tools"];

export function apply(ctx: Context) {
  ctx.tools.register(
    defineTool({
      name: "read_file",
      description: "Read a file from disk.", // 模型看到的内容
      parameters: {
        path: { type: "string", required: true, description: "Absolute path" },
        limit: { type: "number" }, // 默认可选
      },
      output: {
        schema: { type: "string" },
        render: (_args, value) => [{ type: "text", text: value }],
      },
      async execute(args, exec) {
        // args 由 schema 推导类型；exec 携带不可变身份 + token，signal 是操作字段
        return readFile(args.path, { encoding: "utf8", signal: exec.signal });
      },
    }),
  );
}
```

注册基于副作用：dispose 插件 fiber 即注销工具；schema 自动流入系统提示词组装。

## execute() 约定

- **参数已校验**：`defineTool` 在 execute 前按 schema 校验模型生成的 arguments；schema DSL 表达不了的约束（非空字符串、正数、跨字段规则）仍需手动检查。直接注册的原始 JSON Schema 工具自行负责校验。
- **注册借用你的只读定义**：注册后不要修改 schema/替换回调；热替换 = dispose 所属副作用再注册替代品。
- **执行身份受保护**：`callId`/`name`/`arguments`/`agent`/`token`/必填 `signal` 全程不可变；`args` 视为只读。只有 around-dispatch 包装器收到可变视图（可替换并恢复 `exec.signal` 施加截止时间，不能移除）。
- **声明并返回规范 JSON 值**：`output.schema` 根可以是对象/数组/标量/null；execute 返回推导值，注册表无损快照、校验、冻结后传给 `output.render(args, value)`。工具主体不要返回内容块，不要迫使调用方从自然语言解析 id。
- **抛异常或返回无效值 = `isError`**：注册表捕获并收敛 schema/渲染器/无损 JSON 失败。基础设施故障抛异常；成功但状态不理想的领域结果写入规范值，由渲染器解释。
- **遵守 `exec.signal`**；**`exec.agent` 发异步通知**：`agent.inject({ content, source: { kind: 'plugin', plugin: '<name>' } })` 追加持久化上下文（不是唤醒），防范已 dispose 的 agent。

## 长时间运行的工作

producer 配置控制 `run_in_background`，用 `ctx.jobs.start({ kind, label, owner: exec.agent, run })` 注册任务；成功后台分支返回类型化规范句柄（如 `{ kind: 'background', jobId }`），渲染器保留人类可读文案但 Code Mode 绝不能靠解析文本取 id。`ctx.jobs.start()` 发布 id 后改用任务自有取消信号，不用 `exec.signal`（取消外层调用只停等待，不停已发布工作）；前台工作仍与 `exec.signal` 耦合。完整约定见 `dsh-tool-bash` 与后台任务运行时 Agent Note。

## 执行策略与观测（不要把部署策略内建进工具）

- `tools/pre-execute` —— 可扩展的允许/拒绝/询问策略（权限门禁示例见 [扩展模式](扩展模式.md)）
- `ctx.tools.guard()` —— 最终的单调拒绝，后续监听器无法撤销
- `tools/execute` —— 截止时间/重试/指标（环绕分发）
- `tools/post-execute` —— 替换展示内容或返回值、阻止结果、附加模型可见上下文
- `tools/result` —— 观测不可变归一化结果而不改变它

顺序与失败行为见 参考/概念 的 [Tool执行](../概念/Tool执行.md)。

## Code Mode 自动触达

Code Mode 中每个可见工具可 `await tools.<name>(args)` 调用（生成的 `ToolArgsMap`/`ToolOutputMap` 由同一 schema 派生），成功解析为策略处理后的最终规范 JSON 值（非渲染内容），失败以真正的 `ToolCallError` reject。把 `output.schema` 设计成实用的程序化 API；人类解释放 `output.render`。

## UI 卡片（独立关注点）

`presentCall(args)` → PENDING 卡片、`presentResult(args, {content, isError, meta?})` → 完成卡片，返回 `card` 标签的渲染意图（`generic`/`terminal`/`diff`/`search`/`web`）。硬性规则：

- **纯函数**：实时流式与日志回放都会运行，不做 I/O、不读会话状态、不用时钟/随机数。
- **UI 格式不进模型结果**：围栏块/diff/相对化路径只为 UI 服务时不进规范值或 Native 内容。
- **展示路径软校验**：格式错误/旧日志的参数返回 undefined（通用回退），展示绝不能导致回放崩溃。

中性词汇在 `dsh-tools` 定义，工具绝不导入 UI/传输类型。
