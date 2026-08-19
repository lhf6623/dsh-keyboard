import type { ReactNode } from "react";
import {
  setConfig,
  VibeConfig,
  ShakeLevel,
  MoleFrequency,
} from "@/client/lib/config";
import { useConfig } from "@/client/hooks/useConfig";

const SHAKE_LABELS: Record<ShakeLevel, string> = {
  off: "关",
  light: "轻",
  medium: "中",
  strong: "强",
};
const SHAKE_LEVELS: ShakeLevel[] = ["off", "light", "medium", "strong"];
const MOLE_LABELS: Record<MoleFrequency, string> = {
  low: "低",
  medium: "中",
  high: "高",
};
const MOLE_FREQUENCIES: MoleFrequency[] = ["low", "medium", "high"];

// —— 系统设置面板行模板（对齐 DSH 通用设置）——
const ROW = [
  "vibe-flex",
  "vibe-items-center",
  "vibe-gap-2",
  "vibe-py-4",
  "vibe-border-0",
  "vibe-border-b",
  "vibe-border-solid",
  "vibe-border-[var(--dsw-alias-border-l2)]",
].join(" ");
const ROW_LAST = ROW + " vibe-border-b-0";
// 主开关标题行：加粗标题 + 左右对称，无底边框（关闭时不留残线；非首组加顶部边框分隔）
const HEAD_ROW =
  "vibe-flex vibe-items-center vibe-justify-between vibe-gap-2 vibe-py-4";
const HEAD_ROW_DIV =
  HEAD_ROW +
  " vibe-border-0 vibe-border-t vibe-border-solid vibe-border-[var(--dsw-alias-border-l2)] vibe-mt-3";
// 子项行：左缩进形成层级
const INDENT = " vibe-pl-6";
const ROW_TEXT = "vibe-flex vibe-flex-col vibe-flex-1 vibe-gap-1 vibe-min-w-0";
const TITLE =
  "vibe-text-[14px] vibe-leading-[22px] vibe-text-[var(--dsw-alias-label-primary)]";
const DESC =
  "vibe-text-[12px] vibe-leading-[18px] vibe-text-[var(--dsw-alias-label-tertiary)]";
// 主开关行标题：加粗，与子项区分
const HEAD_TITLE = TITLE + " vibe-font-semibold";
const CHECKBOX =
  "vibe-accent-[var(--dsw-alias-brand-primary)] vibe-w-[15px] vibe-h-[15px]";
const RANGE = "vibe-accent-[var(--dsw-alias-brand-primary)] vibe-w-[140px]";
const VALUE =
  "vibe-text-[12px] vibe-text-[var(--dsw-alias-label-tertiary)] vibe-tabular-nums vibe-min-w-10 vibe-text-right";
const PILL = [
  "vibe-box-border",
  "vibe-border",
  "vibe-border-solid",
  "vibe-rounded-[16px]",
  "vibe-px-[14px]",
  "vibe-py-[6px]",
  "vibe-text-[13px]",
  "vibe-cursor-pointer",
  "vibe-transition-[background-color,border-color]",
].join(" ");
const PILL_ON =
  "vibe-bg-[var(--dsw-alias-bg-module-platform)] vibe-border-[var(--dsw-static-neutral-bluish-400)] vibe-text-[var(--dsw-alias-label-primary)]";
const PILL_OFF =
  "vibe-bg-transparent vibe-border-[var(--dsw-alias-border-l2)] vibe-text-[var(--dsw-alias-label-secondary)]";

function Row(props: {
  title: string;
  desc?: string;
  last?: boolean;
  indent?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={(props.last ? ROW_LAST : ROW) + (props.indent ? INDENT : "")}
    >
      <div className={ROW_TEXT}>
        <div className={TITLE}>{props.title}</div>
        {props.desc ? <div className={DESC}>{props.desc}</div> : null}
      </div>
      {props.children}
    </div>
  );
}

/** 独立「氛围」设置标签（settings.section）：每组 = 标题行 + 主开关 + 条件子项。 */
export function VibeCard() {
  const cfg = useConfig();
  const update = (patch: Partial<VibeConfig>) => setConfig(patch);

  return (
    <div className="vibe-flex vibe-flex-col">
      {/* 键盘外观：主开关 = 显示键盘 */}
      <div className={HEAD_ROW}>
        <div className={HEAD_TITLE}>键盘外观</div>
        <input
          className={CHECKBOX}
          type="checkbox"
          checked={cfg.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
      </div>
      {cfg.enabled && (
        <>
          <Row title="键盘透明度" indent>
            <input
              className={RANGE}
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={cfg.opacity}
              onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
            />
            <span className={VALUE}>{Math.round(cfg.opacity * 100)}%</span>
          </Row>
          <Row
            title="翻出频率"
            desc="新动物出现的快慢；间隔越短，动物在键上停留越短"
            indent
          >
            <div className="vibe-inline-flex vibe-gap-1.5">
              {MOLE_FREQUENCIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={
                    PILL + " " + (cfg.moleFrequency === f ? PILL_ON : PILL_OFF)
                  }
                  onClick={() => update({ moleFrequency: f })}
                >
                  {MOLE_LABELS[f]}
                </button>
              ))}
            </div>
          </Row>
          <Row title="同时显示数量" desc="屏幕上同时显示动物的上限" last indent>
            <input
              className={RANGE}
              type="range"
              min="1"
              max="10"
              step="1"
              value={cfg.molePoolSize}
              onChange={(e) =>
                update({ molePoolSize: parseInt(e.target.value, 10) })
              }
            />
            <span className={VALUE}>{cfg.molePoolSize}只</span>
          </Row>
        </>
      )}

      {/* 打字反馈：主开关 = 组总开关，子项 = 火焰 + 输入抖动 */}
      <div className={HEAD_ROW_DIV}>
        <div className={HEAD_TITLE}>打字反馈</div>
        <input
          className={CHECKBOX}
          type="checkbox"
          checked={cfg.feedback}
          onChange={(e) => update({ feedback: e.target.checked })}
        />
      </div>
      {cfg.feedback && (
        <>
          <Row title="打字火焰" indent>
            <input
              className={CHECKBOX}
              type="checkbox"
              checked={cfg.flame}
              onChange={(e) => update({ flame: e.target.checked })}
            />
          </Row>
          <Row title="输入抖动" last indent>
            <div className="vibe-inline-flex vibe-gap-1.5">
              {SHAKE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={
                    PILL + " " + (cfg.shake === level ? PILL_ON : PILL_OFF)
                  }
                  onClick={() => update({ shake: level })}
                >
                  {SHAKE_LABELS[level]}
                </button>
              ))}
            </div>
          </Row>
        </>
      )}

      {/* 回答反馈：主开关 = 组总开关，子项 = 整页抖动 + 提示音 */}
      <div className={HEAD_ROW_DIV}>
        <div className={HEAD_TITLE}>回答反馈</div>
        <input
          className={CHECKBOX}
          type="checkbox"
          checked={cfg.response}
          onChange={(e) => update({ response: e.target.checked })}
        />
      </div>
      {cfg.response && (
        <>
          <Row title="回答后整页抖动" indent>
            <input
              className={CHECKBOX}
              type="checkbox"
              checked={cfg.pageShake}
              onChange={(e) => update({ pageShake: e.target.checked })}
            />
          </Row>
          <Row title="整页抖动强度" indent>
            <div className="vibe-inline-flex vibe-gap-1.5">
              {SHAKE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={
                    PILL +
                    " " +
                    (cfg.pageShakeLevel === level ? PILL_ON : PILL_OFF)
                  }
                  onClick={() => update({ pageShakeLevel: level })}
                >
                  {SHAKE_LABELS[level]}
                </button>
              ))}
            </div>
          </Row>
          <Row title="回答提示音" last indent>
            <input
              className={CHECKBOX}
              type="checkbox"
              checked={cfg.sound}
              onChange={(e) => update({ sound: e.target.checked })}
            />
          </Row>
        </>
      )}
    </div>
  );
}
