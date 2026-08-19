import * as React from 'react'
import { Key } from './Key'

export function ArrowView(props: { pressed: Record<string, boolean> }) {
  return (
    <div className="vibe-flex vibe-flex-col vibe-gap-[5px]">
      <div className="vibe-flex vibe-gap-[5px]">
        <div style={{ width: '30px' }} />
        <Key label="↑" w={1} on={!!props.pressed['ArrowUp']} />
        <div style={{ width: '30px' }} />
      </div>
      <div className="vibe-flex vibe-gap-[5px]">
        <Key label="←" w={1} on={!!props.pressed['ArrowLeft']} />
        <Key label="↓" w={1} on={!!props.pressed['ArrowDown']} />
        <Key label="→" w={1} on={!!props.pressed['ArrowRight']} />
      </div>
    </div>
  )
}
