import * as React from 'react'
import { ROWS } from '../components/keyboard/layout'
import { getConfig, subscribeConfig, MoleFrequency } from '../lib/config'
import { reducedMotion } from '../lib/fx/motion'

// —— 动物图标池（87 个）——
// 来源：Unicode 表情符号（emoji），浏览器原生渲染，无需图片资源。
// 获取/新增：Windows 按 Win + . 打开表情面板复制，或查 https://unicode.org/emoji/charts/emoji-list.html；
// 直接往下方数组加一个 emoji 字符串即可（数量随意，随机抽取）。
// 组成：十二生肖 12 个 + 25 个国家的代表性动物各 3 个 = 87。
const ANIMALS = [
  // —— 十二生肖 ——
  '🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷', // 鼠牛虎兔龙蛇马羊猴鸡狗猪
  // —— 各国代表性动物（每国 3 个）——
  '🐼', '🐉', '🐅', // 中国：熊猫 / 龙 / 虎
  '🦘', '🐨', '🦜', // 澳大利亚：袋鼠 / 考拉 / 鹦鹉
  '🦅', '🦬', '🦝', // 美国：白头鹰 / 野牛 / 浣熊
  '🐘', '🦚', '🦏', // 印度：大象 / 孔雀 / 犀牛
  '🐻', '🦌', '🦉', // 俄罗斯：棕熊 / 驯鹿 / 猫头鹰
  '🐒', '🐈', '🦢', // 日本：猕猴 / 三花猫 / 丹顶鹤
  '🦁', '🐺', '🦢', // 英国：狮子 / 狼 / 天鹅
  '🐓', '🐺', '🦉', // 法国：高卢鸡 / 狼 / 猫头鹰
  '🦅', '🐗', '🦌', // 德国：鹰 / 野猪 / 鹿
  '🦜', '🐆', '🦋', // 巴西：鹦鹉 / 美洲豹 / 蝴蝶
  '🦫', '🦬', '🦌', // 加拿大：河狸 / 野牛 / 麋鹿
  '🦁', '🦏', '🦒', // 南非：狮子 / 犀牛 / 长颈鹿
  '🦓', '🦏', '🦒', // 肯尼亚：斑马 / 犀牛 / 长颈鹿
  '🐪', '🐆', '🦅', // 埃及：骆驼 / 猎豹 / 隼
  '🐘', '🐅', '🦜', // 泰国：大象 / 老虎 / 鹦鹉
  '🐂', '🦁', '🦅', // 西班牙：公牛 / 狮子 / 鹰
  '🐺', '🦅', '🦉', // 意大利：母狼 / 鹰 / 猫头鹰
  '🦁', '🐄', '🐐', // 荷兰：狮子 / 奶牛 / 山羊
  '🐄', '🐐', '🐕', // 瑞士：奶牛 / 山羊 / 圣伯纳
  '🦌', '🐻', '🦅', // 挪威：驯鹿 / 棕熊 / 海鹰
  '🐦', '🦜', '🐑', // 新西兰：几维鸟 / 鹦鹉 / 绵羊
  '🦉', '🐐', '🐬', // 希腊：猫头鹰 / 山羊 / 海豚
  '🦅', '🐺', '🦜', // 墨西哥：金雕 / 灰狼 / 鹦鹉
  '🐎', '🐄', '🦅', // 阿根廷：马 / 牛 / 鹰
  '🦅', '🦉', '🐋', // 冰岛：海鹰 / 海鹦 / 鲸
]

// —— 打地鼠：定时随机选一个键，动物在该键组件内部钻出 ——
export function useMole(): { enabled: boolean; target: { code: string; animal: string } | null } {
  const [enabled, setEnabled] = React.useState(false)
  const [freq, setFreq] = React.useState<MoleFrequency>('medium')
  const [target, setTarget] = React.useState<{ code: string; animal: string } | null>(null)

  React.useEffect(() => {
    const update = () => { const c = getConfig(); setEnabled(c.mole && c.enabled); setFreq(c.moleFrequency) }
    update()
    return subscribeConfig(update)
  }, [])

  React.useEffect(() => {
    if (!enabled || reducedMotion()) return
    // 候选键：排除布局占位与空格键（太宽，翻转效果差）
    const codes = ROWS.flatMap((row) => row.map((k) => k[0])).filter((c) => c !== '_spacer' && c !== 'Space')
    const base = freq === 'low' ? 9000 : freq === 'high' ? 3000 : 5500
    let timer: number | null = null
    let hideTimer: number | null = null
    let lastCode = ''

    function schedule() {
      const delay = base + (Math.random() - 0.5) * base * 0.6
      timer = window.setTimeout(() => {
        // 避免连续两次同一个键（保证 Key 的 mole prop 值变化，动画能重播）
        let code = codes[Math.floor(Math.random() * codes.length)]
        while (code === lastCode && codes.length > 1) {
          code = codes[Math.floor(Math.random() * codes.length)]
        }
        lastCode = code
        setTarget({ code, animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)] })
        const stay = 1500 + Math.random() * 600
        hideTimer = window.setTimeout(() => { setTarget(null); schedule() }, stay + 600)
      }, delay)
    }
    schedule()
    return () => {
      if (timer) window.clearTimeout(timer)
      if (hideTimer) window.clearTimeout(hideTimer)
      setTarget(null)
    }
  }, [enabled, freq])

  return { enabled, target }
}
