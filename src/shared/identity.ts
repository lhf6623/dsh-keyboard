// 具名导入：打包时只取 name 字段（rollup JSON 树摇），不把整份 package.json 打进产物。
// with { type: "json" }：Vite 未来 native config loader 要求的 import attributes。
import { name as packageName } from "../../package.json" with { type: "json" };

/**
 * 插件身份唯一真源：package.json 的 name。
 * 宿主/客户端各处需要插件名时统一从这里取，不要各自 import package.json 再拼接。
 */

/** 插件名（= package.json name，harness 按它解析插件行与 settings namespace）。 */
export function pluginName(): string {
  return packageName;
}

/** localStorage 配置持久化键（`<包名>.config`）。 */
export function configStorageKey(): string {
  return `${packageName}.config`;
}
