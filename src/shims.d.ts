// 类型占位：这些模块在构建时由 esbuild 特殊处理（external / text loader），
// 不经过 npm 解析，这里只给编辑器提供最小类型，运行时行为以 build.mjs 为准。

declare module '*.css' {
  const content: string
  export default content
}

declare module '@deepseek-ai/schemastery' {
  const z: any
  export default z
}

declare module '@deepseek-ai/dsh-settings' {
  export function settingsNamespace(value: string): string
}
