import * as React from "react";

/**
 * 输入框上方悬浮层的位置测量：bottom = 距视口底部，left = 内容区水平中心（未测得为 null）。
 * 输入框的位置会随多种情况变化：视口缩放、任意滚动（含内部容器）、内容增长把输入框
 * 往下推（AI 回复后 composer 从垂直居中移到下方）、shell 布局重排（侧边栏切换等）。
 * 这里统一监听所有这些来源，用 rAF 合并高频触发，只有位置实际变化才更新 state。
 */
export function useComposerPosition(): { bottom: number; left: number | null } {
  const [bottom, setBottom] = React.useState(170);
  const [left, setLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    function measure() {
      const overlay = document.querySelector("[data-shell-overlay]");
      const frame = overlay ? overlay.parentElement : null;
      if (frame) {
        const tpl =
          frame.style.gridTemplateColumns ||
          getComputedStyle(frame).gridTemplateColumns;
        const m1 = tpl.match(/^\s*([\d.]+)px/);
        const m2 = tpl.match(/([\d.]+)px\s*$/);
        const sidebarW = m1 ? parseFloat(m1[1]) : 0;
        const detailsW = m2 ? parseFloat(m2[1]) : 0;
        const l = Math.round(
          sidebarW + (window.innerWidth - sidebarW - detailsW) / 2,
        );
        setLeft((prev) => (prev === l ? prev : l));
      }
      const el =
        document.querySelector("[data-composer-card]") ||
        document.querySelector("[data-composer-seat]");
      if (el) {
        const rect = el.getBoundingClientRect();
        const b = Math.round(window.innerHeight - rect.top + 10);
        setBottom((prev) => (prev === b ? prev : b));
      }
    }
    let rafId: number | null = null;
    function scheduleMeasure() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        measure();
      });
    }
    measure();
    window.addEventListener("resize", scheduleMeasure);
    // capture 阶段监听，覆盖所有内部滚动容器（聊天区滚动也会移动输入框）
    window.addEventListener("scroll", scheduleMeasure, true);
    let obs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      obs = new ResizeObserver(scheduleMeasure);
      const seat =
        document.querySelector("[data-composer-card]") ||
        document.querySelector("[data-composer-seat]");
      if (seat) obs.observe(seat);
      // 内容增长（如 AI 流式回复）会把输入框往下推：观察 body/html 尺寸变化
      obs.observe(document.body);
      obs.observe(document.documentElement);
    }
    let mo: MutationObserver | null = null;
    const ov = document.querySelector("[data-shell-overlay]");
    const fr = ov ? ov.parentElement : null;
    if (fr && typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(scheduleMeasure);
      // childList + subtree：输入框被移动/重排、聊天内容插入等都会触发重新测量
      mo.observe(fr, {
        attributes: true,
        attributeFilter: [
          "style",
          "class",
          "data-sidebar-collapsed",
          "data-details-collapsed",
        ],
        childList: true,
        subtree: true,
      });
    }
    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (obs) obs.disconnect();
      if (mo) mo.disconnect();
    };
  }, []);

  return { bottom, left };
}
