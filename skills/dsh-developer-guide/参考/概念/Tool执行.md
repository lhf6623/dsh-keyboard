# Tool 执行流水线

官方原文：harness `docs/tool-execution-pipeline.zh.md`；选择规则见 `docs/cookbook/adding-a-tool.zh.md`。

## 流水线顺序

策略、钩子、沙箱、文件系统守卫、结果重写、最终结果观察和 UI 渲染都在**不改变循环**的情况下运行：

```
模型消息含 tool-call 块
  → 会话事件 tool/call                      （执行前记录）
  → UI pending card：presentCall(args)
  → tools/pre-execute  waterfall            钩子、权限、沙箱（可重排的策略层）
      → deny        → 工具体跳过
      → ask         → ctx.approval 一次性提问（absent/unanswerable → deny）
                       allowed-once → 继续
  → 注册的单调守卫                            deny 或 abstain；身份受保护
  → tools/execute  waterfall                 超时/重试/指标（环绕分发；仅 exec.signal 可替换）
  → 工具 execute() 体
      → fs/write-intent / fs/edit-intent    tool-fs 变更专属门禁（fs/* 事件实现）
      → 工具自有会话事件                      todo/write、fs/observed、hook/invoked、
                                             hook/result、tool/code-dispatch
  → tools/post-execute  waterfall           accept、block、replace、add context
  → 注册表外层规范化                         流水线/结果快照抛错 → isError
  → ToolDefinition.finalizeContent          最后的内容不变式（同步、仅限内容）
  → tools/result                            同步通知：冻结的权威结果
  → 会话事件 tool/result                     单一面向模型结果
  → 批次落定 → additionalContexts FIFO（注入的 user/message 在已记录结果之后）
  → UI completed card：presentResult(args, result)
```

## 四个扩展点的选择规则

| 扩展点 | 何时用 |
| --- | --- |
| `tools/pre-execute`（waterfall） | 可重排的策略层：钩子、权限门禁（返回 `{ kind: 'deny' }` / `{ kind: 'ask' }` 类型化决策）、沙箱能力级拒绝 |
| `ctx.tools.guard()` | 不变式需要**单调**的最终拒绝（身份受保护，不得重排） |
| `tools/execute`（waterfall） | 包裹实际分发生命周期：超时/重试/指标；仅 `exec.signal` 可替换 |
| `tools/post-execute`（waterfall） | 显式结果变换：接受、阻止、替换、附加上下文 |
| `tools/result` | 对不可变最终结果的受限观察（指标/审计/捕获；不用于变换） |

## 关键语义

- 文件系统先读后编辑检查位于 `tool-fs` 之下，通过 `fs/*` 事件实现；通用前置/后置 waterfall 承载钩子与审批策略。
- `ctx.approval` 在单调守卫**之前**处理询问；不得重排的所有者策略仍作为已注册守卫。
- 注册表对候选结果做无损快照；快照失败先规范化为 isError，再由已随快照固定的 `finalizeContent` 回调执行同步、仅限内容的不变式。之后 `tools/result` 观察不可变、可 JSON 无损表示的结果。
- 这样钩子可跨工具系列工作，无需让工具与某个策略服务耦合。
- Code Mode 把保留的 `run_code` 传输及其序列化子调用一并送入流水线；子调用携带父级 token、记录 `tool/code-dispatch`、把拒绝呈现为有约束力的驳回，并省略 `additionalContexts` 以保持调用与结果相邻。
- 单调终端轮次策略：从成功的终端工具调用 `ToolExecution.concludeTurn()`；同一响应中后续工具调用仍可由守卫阻止，循环在该步骤后停止。
