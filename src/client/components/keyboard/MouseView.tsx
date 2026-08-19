import { MouseState } from "@/client/hooks/useMouseState";

// —— 鼠标：机身/按键/滚轮，配色按状态二选一渲染 ——
const MOUSE_BODY = [
  "vibe-relative vibe-w-[58px] vibe-h-[90px] vibe-rounded-[28px_28px_22px_22px]",
  "vibe-border vibe-border-solid vibe-border-[rgba(0,0,0,0.2)]",
  "vibe-bg-[rgba(255,255,255,0.25)]",
  "vibe-shadow-[0_1px_4px_rgba(0,0,0,0.2)]",
  "dsh-dark:vibe-border-[rgba(255,255,255,0.14)]",
  "dsh-dark:vibe-bg-[rgba(255,255,255,0.07)]",
  "dsh-dark:vibe-shadow-[0_1px_4px_rgba(0,0,0,0.45)]",
].join(" ");

const MOUSE_BTN = [
  "vibe-absolute vibe-top-0 vibe-w-1/2 vibe-h-[40px]",
  "vibe-border-0 vibe-border-b vibe-border-solid vibe-border-b-[rgba(0,0,0,0.18)]",
  "vibe-transition-[background-color]",
  "dsh-dark:vibe-border-b-[rgba(255,255,255,0.12)]",
].join(" ");

const MOUSE_BTN_ON =
  "vibe-bg-[rgba(88,150,255,0.18)] dsh-dark:vibe-bg-[rgba(88,150,255,0.3)]";

const WHEEL_BASE = [
  "vibe-absolute vibe-left-1/2 vibe-translate-x--1/2 vibe-w-[9px] vibe-h-[20px] vibe-rounded-[5px]",
  "vibe-border vibe-border-solid vibe-border-[rgba(0,0,0,0.2)]",
  "vibe-transition-[background-color,top]",
  "dsh-dark:vibe-border-[rgba(255,255,255,0.18)]",
].join(" ");

export function MouseView(props: { mouse: MouseState }) {
  const m = props.mouse;
  const wheelTop = m.middle ? "vibe-top-[6px]" : "vibe-top-[20px]";
  const wheelBg = m.wheel
    ? "vibe-bg-[rgba(88,150,255,0.3)] dsh-dark:vibe-bg-[rgba(88,150,255,0.42)]"
    : "vibe-bg-[rgba(150,150,150,0.55)] dsh-dark:vibe-bg-[rgba(200,200,200,0.42)]";
  return (
    <div className={MOUSE_BODY}>
      <div
        className={
          MOUSE_BTN +
          " vibe-left-0 vibe-rounded-tl-[28px]" +
          (m.left ? " " + MOUSE_BTN_ON : "")
        }
      />
      <div
        className={
          MOUSE_BTN +
          " vibe-right-0 vibe-rounded-tr-[28px]" +
          (m.right ? " " + MOUSE_BTN_ON : "")
        }
      />
      <div className={WHEEL_BASE + " " + wheelTop + " " + wheelBg} />
    </div>
  );
}
