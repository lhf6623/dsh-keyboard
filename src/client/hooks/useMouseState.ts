import * as React from "react";
import {
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onMouseLeave,
  onWheel,
} from "../lib/events/mouse";
import { onPageDeactivate } from "../lib/events/page";

export interface MouseState {
  left: boolean;
  right: boolean;
  middle: boolean;
  wheel: boolean;
}

/** 全局鼠标状态：左/中/右键与滚轮（滚轮 180ms 后自动回落）。订阅鼠标事件源（events/mouse.ts）。 */
export function useMouseState(): MouseState {
  const [mouse, setMouse] = React.useState<MouseState>({
    left: false,
    right: false,
    middle: false,
    wheel: false,
  });

  React.useEffect(() => {
    function clearMouse() {
      setMouse((prev) =>
        !prev.left && !prev.right && !prev.middle && !prev.wheel
          ? prev
          : { left: false, right: false, middle: false, wheel: false },
      );
    }
    function applyButtons(buttons: number) {
      setMouse((prev) => {
        const n: MouseState = {
          left: !!(buttons & 1),
          right: !!(buttons & 2),
          middle: !!(buttons & 4),
          wheel: prev.wheel,
        };
        if (
          n.left === prev.left &&
          n.right === prev.right &&
          n.middle === prev.middle
        )
          return prev;
        return n;
      });
    }
    function onMouse(e: MouseEvent) {
      applyButtons(e.buttons || 0);
    }
    function handleMouseLeave() {
      setMouse((prev) =>
        !prev.left && !prev.right && !prev.middle
          ? prev
          : { left: false, right: false, middle: false, wheel: prev.wheel },
      );
    }
    let wheelTimer: number | null = null;
    function handleWheel() {
      setMouse((prev) => ({
        left: prev.left,
        right: prev.right,
        middle: prev.middle,
        wheel: true,
      }));
      if (wheelTimer) window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        setMouse((prev) =>
          prev.wheel
            ? {
                left: prev.left,
                right: prev.right,
                middle: prev.middle,
                wheel: false,
              }
            : prev,
        );
      }, 180);
    }

    const offDown = onMouseDown(onMouse);
    const offUp = onMouseUp(onMouse);
    const offMove = onMouseMove(onMouse);
    const offLeave = onMouseLeave(handleMouseLeave);
    const offWheel = onWheel(handleWheel);
    const offPage = onPageDeactivate(clearMouse);
    return () => {
      offDown();
      offUp();
      offMove();
      offLeave();
      offWheel();
      offPage();
      if (wheelTimer) window.clearTimeout(wheelTimer);
    };
  }, []);

  return mouse;
}
