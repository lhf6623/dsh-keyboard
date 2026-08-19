import * as React from 'react'
import { getConfig, subscribeConfig, VibeConfig } from '../lib/config'

/** 订阅配置 store：先取当前值，store 变化（设置面板 / 系统 scope 写入）时实时更新。 */
export function useConfig(): VibeConfig {
  const [cfg, setCfg] = React.useState<VibeConfig>(getConfig())
  React.useEffect(() => {
    setCfg(getConfig())
    return subscribeConfig(setCfg)
  }, [])
  return cfg
}
