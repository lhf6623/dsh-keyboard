# 新增 Conversation Node

官方原文：harness `docs/cookbook/adding-a-conversation-node.zh.md`。为 Web Client Chat 视图添加一行由业务自行拥有的内容：把持久 Session 事件族关联成 Context，增量构造业务 State，发布类型化 Step 数据，渲染 keyed Chat Node——全程不扫描 Session 窗口或其他已渲染节点。

## 1. 设计可回放的事件族

- 先选定**稳定业务 id**：构成同一 Node 的每条事件都必须携带该 id 或仅凭自身 payload 独立推导；Client 绝不能把 update 猜成属于「最近一个未完成」的 Context。
- 角色约定：唯一 `start`（含 id、Turn/Step 坐标、初始展示状态）+ 若干 `update`（同 id、可回放进度）。每个 `(kind, id)` 最多一条 start；单事件业务可用 `event.seq` 作内部 id。
- 跨进程边界用生产方拥有的 branded id 类型；`SessionEventMap` 合并放生产方纯类型导出，Client 经仅类型副作用导入。
- 若历史窗口只有 update 没有 start：Assembler 保留 pending Context，等更早分页补齐 start 再构造 State。产品必须在 start 未加载时渲染的话，terminal/checkpoint 事件必须携带足够的完整 fallback 状态——**不要靠扫描无关事件恢复**。

## 2. 实现 Definition 与类型化 Chat payload

```ts
declare module "@deepseek-ai/dsh-session/types" {
  interface SessionEventMap {
    /** @mode emit */
    "review/start": ReviewStartData;
    "review/progress": ReviewProgressData;
    "review/end": ReviewEndData;
  }
}

declare module "@deepseek-ai/dsh-client-ui-conversation/client" {
  interface ChatNodeDataMap {
    "review-job": ReviewChatData;
  }
}
declare module "@deepseek-ai/dsh-client-runtime/client" {
  interface ConversationStepDataMap {
    "review-job": ReviewChatData;
  }
}

const reviewDefinition: ConversationNodeDefinition<ReviewState> = {
  kind: "review-job",
  target: "chat",
  match: (event) => {
    // 身份提取器，不是 fold：只收当前事件
    if (event.type === "review/start")
      return { id: String(event.data.reviewId), role: "start" };
    if (event.type === "review/progress" || event.type === "review/end") {
      return { id: String(event.data.reviewId), role: "update" };
    }
    return null;
  },
  start: (_context, match) => ({/* 从 start 事件构造 State */}),
  update: (context, match) => ({/* fold 一个 Match 进 State，确定性可回放 */}),
  publication: (match) =>
    match.event.type === "review/progress" ? "animation-frame" : "immediate",
  buildLocationData: (context, scope) => {
    /* 发布到引擎拥有的 Turn/Step 数据，或 null */
  },
  buildViewNode: (context) => ({
    /* key/kind/id/target/anchorSeq/location/visibility/data */
  }),
};

function ReviewNodeView({ node }: ChatNodeViewProps<"review-job">) {
  return createElement(
    "p",
    null,
    node.data.summary ?? `${node.data.title}: ${node.data.completed}%`,
  );
}

export const inject = ["conversationEvents", "slots"];

export function apply(ctx: ClientContext): void {
  ctx.conversationEvents.register(reviewDefinition);
  ctx.slots.inject("conversation.chat.node", () =>
    ctx.slots.register(
      {
        name: "conversation.chat.node",
        key: "review-job",
      },
      ReviewNodeView,
    ),
  );
}
```

关键规则：

- `match` 命中后 Assembler 按 `(kind, id)` 定位 Context，调用一次 `start` 或把当前 State 交 `update`；两者都必须返回引擎采用的 State（推荐新 immutable 值）。
- `buildLocationData` 可发布数据给同一 Location 内其他 Node 用受限 slot hook（`useTurnData(key)`）读取，无须取 Session。
- `target` 与 `buildViewNode` 必须同时声明渲染贡献；`context.key` 保留为 React 侧身份，`anchorSeq` 选持久排序证据；Node 一旦发布就要继续返回同一个 key，临时离开可见流用 `visibility: 'hidden'`，不要返回 null 撤回。
- `publication`：结构/terminal 变化用 `immediate`，高频可见 delta 用 `animation-frame`，只积累 State 用 `none`。

## 3. 只在 start 时查询更早的业务 Context

`start` 收到 `ConversationContextReader`，用 `reader.previous<State>(kind)` 取当前位置之前最近一个已启动 Context 的只读数据——不要接收 Context 集合或扫描事件。Assembler 记录依赖：更早 prepend 补齐窗口或前序 State 修订时，从 `start` 重新运行依赖方 Context 并按 `seq` 升序回放其 update。

## 4. 三条摄入路径

| 路径                              | 引擎工作                                                                          | Definition 可观察行为                                                         |
| --------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| replace（open/resync/gap repair） | 重建已加载窗口，每条事件对每个 Definition 匹配一次，回放每个已有 start 的 Context | 先 `start`，再按 seq 升序 `update`；只有 update 的 pending Context 仍无 State |
| prepend 更早历史                  | 只匹配新增更早事件，按 `(kind, id)` 合并，只重放受影响 Context 与依赖             | 新发现的 start 激活已收集 update；Location/前序变化可能重跑 Context           |
| append 实时事件                   | 每个 Definition 调一次 `match`，按 key 查 Context，只更新该 Context               | start 之后匹配事件执行一次 `update` + 一次发布；不扫描已有 Context            |

注册 D 个 Definition 时，一条新事件做 D 次仅当前事件匹配，命中后 Context key 查询是常数时间。**append 热路径不得遍历完整事件窗口/所有 Context/`context.matches`/已渲染 Node 集合**：累计事实进 State，同 Turn/Step 共享信息进 Location data，有索引的前序依赖用 `reader.previous()`。

## 5. 验证回放、分页与渲染

聚焦测试证明：完整窗口 replace 产生预期最终 State/Location data/Node payload/anchorSeq；只有 update 的尾部窗口保持 pending、prepend 唯一 start 后与完整 replace 相同；实时 append 与回放合并结果一致；prepend 更早分页只增行、既有 Node value 不被替换；重复可见 delta 保持 `context.key`、`animation-frame` 每帧最多发布一次；keyed renderer 只消费 `node.data` 与受限 Location hook。

参考实现：`packages/client/ui-conversation/src/client/conversation-nodes/assistant.ts`（流式与中断）、`inbox.ts` / `message.ts`（前序查询）、`packages/client/ui-deliverables`（只发布 Turn data 不建 Node）。
