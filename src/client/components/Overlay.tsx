import type { CSSProperties } from "react";
import { clsx } from "clsx";
import { useConfig } from "@/client/hooks/useConfig";
import { useMouseState } from "@/client/hooks/useMouseState";
import { useComposerPosition } from "@/client/hooks/useComposerPosition";
import { useKeyAnimals } from "./keyboard/useKeyAnimals";
import { KeyboardMain } from "./keyboard/KeyboardMain";
import { ArrowView } from "./keyboard/ArrowView";
import { MouseView } from "./keyboard/MouseView";

export function Overlay() {
  const cfg = useConfig();
  const mouse = useMouseState();
  const { bottom, left } = useComposerPosition();
  const animals = useKeyAnimals();

  const rootStyle: CSSProperties = { bottom: bottom + "px" };
  if (left !== null) rootStyle.left = left + "px";
  rootStyle.opacity = cfg.opacity;

  const keyboard =
    left !== null ? (
      <div
        className={clsx(
          "vibe-fixed vibe-z-40 vibe-pointer-events-none vibe-origin-[50%_100%] vibe-transition-[left,bottom] vibe-duration-300 [@media(max-width:920px)]:vibe-hidden motion-reduce:vibe-transition-none",
          "vibe-translate-x--1/2",
          !cfg.enabled && "vibe-hidden",
        )}
        style={rootStyle}
      >
        <div className="vibe-flex vibe-items-stretch vibe-gap-[3px]">
          <KeyboardMain animals={animals} />
          <div className="vibe-flex vibe-flex-col vibe-justify-between vibe-items-center">
            <MouseView mouse={mouse} />
            <ArrowView animals={animals} />
          </div>
        </div>
      </div>
    ) : null;

  return keyboard;
}
