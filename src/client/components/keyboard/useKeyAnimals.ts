import { useEffect, useState } from "react";
import { ROWS } from "./layout";
import { useConfig } from "@/client/hooks/useConfig";
import type { MoleFrequency } from "@/client/lib/config";
import { onKeyDown } from "@/client/lib/events/keyboard";
import { reducedMotion } from "@/client/lib/fx/motion";

// —— 动物图标池：程序化枚举 Unicode 动物区段（零依赖、无重复、权重均匀）——
// 区段 1F400-1F43F（6.0-7.0，哺乳/鸟类/鱼类）与 1F980-1F99F（8.0-11.0，补充动物）。
// 终点 1F99F = Unicode 11.0：Windows 10（≤12）与较旧 Android（≤11 较稳）都能显示；
// 只跑 Win10 可放宽到 1F9AB（=12.0，多出 🦦 等约 10 只）。
// 调整：查 https://unicode.org/emoji/charts/emoji-list.html 确认码点与版本；
// EXCLUDE 放不适合当「小动物」的（虫类/海鲜/身体部位），改集合即可增删。
const RANGES: Array<[number, number]> = [
  [0x1f400, 0x1f43f],
  [0x1f980, 0x1f99f],
];

const EXCLUDE = new Set([
  // 虫类与爬虫
  "🐌",
  "🐛",
  "🐜",
  "🐝",
  "🐞",
  "🦂",
  "🦗",
  "🦟",
  // 海鲜
  "🦀",
  "🦐",
  "🦑",
  "🦞",
  // 非动物：贝壳 / 猪鼻 / 爪印
  "🐚",
  "🐽",
  "🐾",
]);

const ANIMALS = RANGES.flatMap(([a, b]) =>
  Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)),
).filter((e) => !EXCLUDE.has(e));

// 可显示动物的键：布局键位 + 方向键（其余按键按下不产生显示）
const CODES = new Set(
  ROWS.flatMap((row) => row.map((k) => k[0]))
    .filter((c) => c !== "_spacer" && c !== "Space")
    .concat(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]),
);

/** off 模式下排空游标的周期：池非空时每该时长移除最老一只（沿用 Key 的 600ms 翻面动画）。 */
const OFF_PRESS_RETURN_MS = 1500;

/** 自动翻出频率对应的基础间隔（毫秒）——仅用作非 off 自动翻调度延迟（动物驻留，靠池满淘汰）。 */
function freqBaseMs(freq: MoleFrequency): number {
  return freq === "low" ? 9000 : freq === "high" ? 3000 : 5500;
}

function pick(): string {
  return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
}

/** 池内单只动物。无时间戳：非 off 驻留到被池满顶掉；off 由游标按入池顺序排空。 */
interface PoolItem {
  code: string;
  animal: string;
}

/**
 * 键盘小动物显示管理（code -> animal）：统一动物池，池满才淘汰最老（FIFO）。
 * - 非 off（自动翻）：动物入池后驻留，按 moleFrequency 间隔持续翻出随机键动物
 *   （避开池中已有键），池满顶掉最老——池子填满 molePoolSize 后保持满。
 * - off（翻出频率=关）：空闲不自动翻；按键翻出的动物由排空游标移除——
 *   池非空时每 OFF_PRESS_RETURN_MS 走一只最老的，「按下即翻、到点自动翻回」。
 * - 按下按键：即刻在按下的键上翻出；已在池中的键移到队尾（保持新鲜不被顶掉，
 *   也延后游标排空）。非 off 且未减弱动态时，按下会加速一次自动翻并重启自动计时。
 * - 切模式不清池：切到 off 时游标开始按周期排空驻留动物；切离 off 时游标停，
 *   剩余动物转驻留（池满才被顶掉）。
 * - 池满（molePoolSize）：新动物顶掉最老的一只。
 * 按下检测订阅键盘事件源（events/keyboard.ts），与其它按键消费者互不知晓。
 */
export function useKeyAnimals(): Record<string, string> {
  const cfg = useConfig();
  const [pool, setPool] = useState<PoolItem[]>([]);

  // —— off 模式的排空游标 ——
  // 开关即条件「off && 池非空」：池排空 / 切离 off / 卸载时 cleanup 关闭。
  // 该条件进 effect 依赖：池「空→非空」翻转时重建 interval 重新计时，
  // 保证每只动物至少展示一个周期（避免按键恰好落在 tick 前被立即清掉）；
  // 排空途中池持续非空、依赖不变，interval 不重建，FIFO 节奏不受新按键干扰。
  const draining = cfg.moleFrequency === "off" && pool.length > 0;
  useEffect(() => {
    if (!draining) return;
    const id = window.setInterval(() => {
      setPool((prev) => (prev.length > 0 ? prev.slice(1) : prev));
    }, OFF_PRESS_RETURN_MS);
    return () => window.clearInterval(id);
  }, [draining]);

  useEffect(() => {
    // 池子调小立即生效：只保留最新几只
    setPool((prev) =>
      prev.length > cfg.molePoolSize
        ? prev.slice(prev.length - cfg.molePoolSize)
        : prev,
    );

    const off = cfg.moleFrequency === "off";
    let timer: number | null = null;

    function schedule() {
      const base = freqBaseMs(cfg.moleFrequency);
      const delay = base + (Math.random() - 0.5) * base * 0.6;
      timer = window.setTimeout(() => {
        setPool((prev) => {
          const taken = new Set(prev.map((p) => p.code));
          const candidates = [...CODES].filter((c) => !taken.has(c));
          const code =
            candidates[Math.floor(Math.random() * candidates.length)];
          const next = prev.length >= cfg.molePoolSize ? prev.slice(1) : prev;
          return [...next, { code, animal: pick() }];
        });
        schedule();
      }, delay);
    }

    function press(code: string) {
      setPool((prev) => {
        const idx = prev.findIndex((p) => p.code === code);
        if (idx >= 0) {
          // 已在池中：移到队尾保持新鲜（不被池满顶掉，也延后游标排空）
          const next = [...prev];
          const item = next.splice(idx, 1)[0];
          next.push(item);
          return next;
        }
        const next = prev.length >= cfg.molePoolSize ? prev.slice(1) : prev;
        return [...next, { code, animal: pick() }];
      });
    }

    const offKey = onKeyDown((e) => {
      if (e.repeat) return;
      const code = e.code;
      if (!CODES.has(code)) return;
      press(code);
      // 非 off：按下加速一次自动翻（重启自动计时）。off 下不启动任何自动调度。
      if (!off && !reducedMotion()) {
        if (timer) window.clearTimeout(timer);
        schedule();
      }
    });

    if (!off && !reducedMotion()) schedule();

    return () => {
      offKey();
      if (timer) window.clearTimeout(timer);
    };
  }, [cfg.moleFrequency, cfg.molePoolSize]);

  return Object.fromEntries(pool.map((p) => [p.code, p.animal]));
}
