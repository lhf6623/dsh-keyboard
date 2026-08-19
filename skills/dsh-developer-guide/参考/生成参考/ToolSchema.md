# Tool Schema 目录

官方生成文件：harness `docs/tool-catalog.zh.md`（英文源由 `scripts/gen-tool-catalog.ts` 生成，`pnpm run verify-tool-catalog` 验证新鲜度，doc-sync 门禁的一部分）。**schema JSON 以生成文件为准，不要手抄。**

## 目录内容

已发布插件向 `ctx.tools` 提供的所有**面向模型的工具**：模型通过系统提示词组装获得的 `name`、`description` 和 JSON Schema `parameters`。

- 与 Cordis 目录（纯 AST 处理）不同，生成器在真实上下文中**启动每个工具插件**并读取 `ctx.tools.schemas()`——因为工具 schema 无法静态分析完全确定（运行时展开的枚举、拼接的描述、配置决定的名称、用原始 JSON Schema 的 MCP 工具）。
- 完整性守卫 glob `packages/*/tool-*`，新工具不会在无人察觉的情况下缺文档。
- 每个工具用**默认配置**启动；必填无默认值的 Config 字段由生成器选择分支，包说明会记录展示的是哪个分支。
- 注册的工具名称可以是加载时配置（如 `tool-subagent` 的 `toolName`），随产品发布的别名会记录。
- 范围仅 `packages/*/tool-*`；`examples/` 演示工具（如 `echo`）不在范围内。

## 工具包映射（模型可见名称 → 包）

| 模型可见名称                                                                                               | 包                                                                |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ask_user_question`                                                                                        | dsh-tool-ask-user                                                 |
| `run_code`                                                                                                 | dsh-tools（Code Mode 保留传输）                                   |
| `exit_plan_mode`                                                                                           | dsh-plan-mode                                                     |
| `bash`                                                                                                     | dsh-tool-bash（bash 执行器 seam 的模型消费方）                    |
| `pwsh`                                                                                                     | dsh-tool-pwsh                                                     |
| `cordis_define` / `cordis_inspect_*` / `cordis_run` / `cordis_stop` / `cordis_undefine`                    | dsh-tool-cordis（需显式启用）                                     |
| `bash`（持久 PTY，按所有者隔离）                                                                           | dsh-tool-bash-persistent                                          |
| `str_replace_editor`                                                                                       | dsh-tool-str-replace-editor                                       |
| `edit` / `read` / `read_image` / `write`                                                                   | dsh-tool-fs（先读后编辑检查在 tool-fs 之下，fs/* 事件实现）       |
| `glob` / `grep`                                                                                            | dsh-tool-fs-search（经 ctx.subprocess spawn 随包 ripgrep）        |
| `terminal_*`（6 个）                                                                                       | dsh-tool-terminal（需选择启用）                                   |
| `create_goal` / `get_goal` / `update_goal`                                                                 | dsh-tool-goal                                                     |
| `schedule_create` / `schedule_delete` / `schedule_list`                                                    | dsh-schedule（选择启用）                                          |
| `lsp`                                                                                                      | dsh-tool-lsp（无提供方时返回结构化 LSP_UNAVAILABLE，不改 schema） |
| `ralph`                                                                                                    | dsh-tool-ralph                                                    |
| `skill`                                                                                                    | dsh-tool-skill                                                    |
| `session_event_read` / `session_event_search` / `session_event_trace` / `session_search` / `session_trace` | dsh-tool-session-query（只读，需选择启用）                        |
| `subagent` / `subagent_fork`                                                                               | dsh-tool-subagent（名称取决于 toolName 配置）                     |
| `interrupt_agent` / `list_agents` / `send_message`                                                         | dsh-tool-subagent-control                                         |
| `report`                                                                                                   | dsh-tool-subagent-report（按可继续子级注册，非全局）              |
| `job_kill` / `job_list` / `job_output`                                                                     | dsh-tool-jobs                                                     |
| `todo_write`                                                                                               | dsh-tool-todo（会话所有状态，UI 渲染为检查清单）                  |
| `workflow`                                                                                                 | dsh-tool-workflow                                                 |
| `web_fetch` / `web_search`                                                                                 | dsh-tool-web（提供方选择在 ctx.web 之后，schema 稳定）            |

## 与插件开发的关系

- 你的插件注册工具后，schema 会经 `ctx.systemPrompt` 自动流入提示词组装；模型看到的就是 `defineTool` 的 `parameters` 转出的 JSON Schema（见 开发/基础 的[开发一个工具](../../开发/基础/开发一个工具.md)）。
- 展示/查找/执行对齐的过滤用 `ctx.tools.restrict()`；schema 查本目录对应包小节。
