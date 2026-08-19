import * as React from 'react'
import { ROWS } from './layout'
import { Key } from './Key'
import { useMole } from '../../hooks/useMole'

export function KeyboardMain(props: { pressed: Record<string, boolean> }) {
  const { target } = useMole()
  return (
    <div className="vibe-flex vibe-flex-col vibe-gap-[5px]">
      {ROWS.map((row) => (
        <div className="vibe-flex vibe-gap-[5px]" key={row[0][0]}>
          {row.map((k, i) => {
            if (k[0] === '_spacer') return <div key={'spacer-' + i} style={{ width: k[2] + 'px' }} />
            return (
              <Key key={k[0]} label={k[1]} w={k[2]} on={!!props.pressed[k[0]]}
                mole={target && target.code === k[0] ? target.animal : undefined} />
            )
          })}
        </div>
      ))}
    </div>
  )
}
