import * as React from "react";
import { ROWS } from "./layout";
import { useConfig } from "../../hooks/useConfig";
import { onKeyDown } from "../../lib/events/keyboard";
import { reducedMotion } from "../../lib/fx/motion";

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

function pick(): string {
  return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
}

/**
 * 键盘小动物显示管理（code -> animal）：统一动物池
 * - 自动翻：按 moleFrequency 间隔持续翻出随机键动物（避开池中已有键）
 * - 按下按键：即刻在按下的键上翻出（加速一次自动翻，并重启自动计时）；
 *   已在池中的键移到队尾（刷新等待时间，不换动物）
 * - 池满（molePoolSize）时：新动物顶掉最老的一只；动物驻留到被顶掉（≈ 池×间隔）
 * 按下检测订阅键盘事件源（events/keyboard.ts），与其它按键消费者互不知晓。
 */
export function useKeyAnimals(): Record<string, string> {
  const cfg = useConfig();
  // 统一动物池：头部最老、尾部最新；自动翻与按下翻共用
  const [pool, setPool] = React.useState<
    Array<{ code: string; animal: string }>
  >([]);

  React.useEffect(() => {
    // 池子调小立即生效：只保留最新几只
    setPool((p) =>
      p.length > cfg.molePoolSize ? p.slice(p.length - cfg.molePoolSize) : p,
    );

    let timer: number | null = null;

    function schedule() {
      const base =
        cfg.moleFrequency === "low"
          ? 9000
          : cfg.moleFrequency === "high"
            ? 3000
            : 5500;
      const delay = base + (Math.random() - 0.5) * base * 0.6;
      timer = window.setTimeout(() => {
        setPool((prev) => {
          const taken = new Set(prev.map((p) => p.code));
          const candidates = [...CODES].filter((c) => !taken.has(c));
          const code =
            candidates[Math.floor(Math.random() * candidates.length)];
          // 池满：最老的一只翻回，新动物翻出（同一帧同时发生）
          const next = prev.length >= cfg.molePoolSize ? prev.slice(1) : prev;
          return [...next, { code, animal: pick() }];
        });
        schedule();
      }, delay);
    }

    const off = onKeyDown((e) => {
      if (e.repeat) return;
      const code = e.code;
      if (!CODES.has(code)) return;
      setPool((prev) => {
        const idx = prev.findIndex((p) => p.code === code);
        if (idx >= 0) {
          // 已在池中：移到队尾（刷新等待时间，不换动物）
          const next = [...prev];
          next.push(next.splice(idx, 1)[0]);
          return next;
        }
        const next = prev.length >= cfg.molePoolSize ? prev.slice(1) : prev;
        return [...next, { code, animal: pick() }];
      });
      // 按下 = 加速一次自动翻：重启调度计时，下一次自动翻在完整间隔之后
      if (!reducedMotion()) {
        if (timer) window.clearTimeout(timer);
        schedule();
      }
    });

    if (!reducedMotion()) schedule();

    return () => {
      off();
      if (timer) window.clearTimeout(timer);
    };
  }, [cfg.moleFrequency, cfg.molePoolSize]);

  return Object.fromEntries(pool.map((p) => [p.code, p.animal]));
}
