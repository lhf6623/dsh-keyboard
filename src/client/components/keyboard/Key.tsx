import { useEffect, useRef, useState } from "react";

// —— 键帽：单一静态外观（按键反馈由动物翻面表达）——
const KEY_BASE = [
  "vibe-flex vibe-items-center vibe-justify-center vibe-h-[30px] vibe-box-border vibe-rounded-md vibe-border vibe-border-solid vibe-text-[10px] vibe-font-mono",
  "vibe-border-[rgba(0,0,0,0.2)]",
  "vibe-bg-[rgba(255,255,255,0.25)]",
  "vibe-text-[rgba(0,0,0,0.45)]",
  "vibe-shadow-[0_1px_0_rgba(0,0,0,0.08)]",
  "dsh-dark:vibe-border-[rgba(255,255,255,0.14)]",
  "dsh-dark:vibe-bg-[rgba(255,255,255,0.07)]",
  "dsh-dark:vibe-text-[rgba(255,255,255,0.72)]",
  "dsh-dark:vibe-shadow-[0_1px_0_rgba(0,0,0,0.35)]",
].join(" ");

export function Key(props: { label: string; w: number; animal?: string }) {
  const flipRef = useRef<HTMLDivElement | null>(null);
  // 背面展示的动物：props.animal 消失时先播翻回动画、结束再清空（避免动物瞬移消失）；
  // 已翻面时换动物只替换内容，不重播动画。
  const [shown, setShown] = useState<string | undefined>(props.animal);
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);

  useEffect(() => {
    if (props.animal !== undefined) {
      setShown(props.animal);
      setFlipped(true);
      flippedRef.current = true;
      return;
    }
    if (!flippedRef.current) return;
    flippedRef.current = false;
    setFlipped(false);
    const el = flipRef.current;
    if (!el) {
      setShown(undefined);
      return;
    }
    const onEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== "transform") return;
      setShown(undefined);
      el.removeEventListener("transitionend", onEnd);
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [props.animal]);

  return (
    <div
      className={KEY_BASE + " vibe-relative"}
      style={{
        width: Math.round(props.w * 30 + (props.w - 1) * 5) + "px",
        perspective: 260,
      }}
    >
      {/* 键帽不动，内部内容层翻面；transition 驱动出现/离开的翻面动画 */}
      <div
        ref={flipRef}
        className="vibe-absolute vibe-inset-0"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 600ms ease-in-out",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="vibe-absolute vibe-inset-0 vibe-flex vibe-items-center vibe-justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          {props.label}
        </div>
        <div
          className="vibe-absolute vibe-inset-0 vibe-flex vibe-items-center vibe-justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          {shown ?? ""}
        </div>
      </div>
    </div>
  );
}
