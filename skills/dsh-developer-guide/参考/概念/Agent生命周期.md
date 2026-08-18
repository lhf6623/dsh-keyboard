# Agent 生命周期

官方原文：harness `docs/agent-lifecycle.zh.md`（[架构](架构.md) 轮次流程的配套时序图）。持久的回放事实在 `session/event` 中，实时控制与状态在 `agent/*` 中。

## 轮次与步骤

一个**步骤** = 一次模型请求 + 它调用的工具。一个**轮次** = 零个或多个步骤：领取首条输入之前打开，不再欠任何工作时关闭。

## 事件时序

```
followup(content)                         输入进入 inbox，唤醒驱动器
agent/inbox/spliced → agent/inbox/inserted { message }
agent/status running
turn/start
  领取 next-step 输入 + 一条排队消息
  agent/inbox/claimed { message, turn }   每条消息一条
  agent/pre-step  waterfall               hook 权威决策：reject 或 enter(messages)
    ├─ 被拒/失败 → 已领取批次保持移除，该轮次不花步骤
    └─ 进入步骤：
        step/start
        user/message                        每条进入的消息
        system-prompt/assemble waterfall    提示词片段 + 工具 schema
        agent/request waterfall → llm/stream waterfall → StreamChunk*
        assistant/chunk*                    （经 session/event 广播）
        ├─ 终端/带内请求失败：
        │    step/end → agent/request-error waterfall → 返回重试动作或保留原错误
        └─ 成功：
             assistant/message
             工具调用循环（barrier + 有界滚动池，启动前重分类执行模式）：
               tool/call（执行前记录）
               tools/pre-execute → 守卫 → tools/execute → tools/post-execute
               tool/result
             step/end
             自然停止且 next-step inbox 为空 → agent/turn-stopping serial 终检
             next-step 输入待处理 → 领取 → 再走 agent/pre-step
turn/end
agent/status idle
```

## 关键语义

- `assistant/message` 记录**每次**成功的提供方调用，包括返回空内容或以 `max-tokens` 结束的调用。空内容不进派生历史，但该持久事件仍保留用量，并通过 `sourceEventSeqs` 精确列出对应的 `assistant/chunk`（含显式空列表）。
- 压缩（`dsh-compaction-basic`）在派生请求之前经 `agent/pre-step` 处理压力；`agent/request-error` 仅用于规范的上下文溢出。触发后先做可选工具结果剪枝，再选择摘要；恢复发生在失败步骤结束之后、失败轮次结束之前；只有剪枝/摘要推进了 surface replacement generation 才开新重试轮次，否则以原始请求错误为准。
- 以返回的 `agent/pre-step` 决策为准；通过包装 `next()` 的监听器保留下游消息，除非有意替换。steering 与注入的上下文在后续认领操作取得下一步骤批次后，经过同一 waterfall。
- 需要可回放 transcript 的 SDK 用户消费 `session/event`；`agent/*` 是队列与状态、提示词拦截、请求构造、steering、继续执行和错误处理的实时协调接口。

## 与本技能相关的切入点（dsh-vibe 模式）

- 「AI 回答完毕」：监听 `session/event`，`event.type === 'turn/end'`（整轮含工具调用结束；live-only，回放不重发）。
- 流式渲染：`assistant/chunk` 的 `data.chunk.type`（text-delta/finish/usage）；最终完整消息 `assistant/message`。
- 注入/steering：`agent.inject()` 与 `agent.followup()` / `agent.steer()`（经 `ctx.agents`）。
