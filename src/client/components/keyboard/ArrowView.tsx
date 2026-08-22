import { Key } from "./Key";

export function ArrowView(props: { animals: Record<string, string> }) {
  return (
    <div className="vibe-flex vibe-flex-col vibe-gap-[5px]">
      <div className="vibe-flex vibe-gap-[5px]">
        <div className="vibe-w-[30px]" />
        <Key label="↑" w={1} animal={props.animals["ArrowUp"]} />
        <div className="vibe-w-[30px]" />
      </div>
      <div className="vibe-flex vibe-gap-[5px]">
        <Key label="←" w={1} animal={props.animals["ArrowLeft"]} />
        <Key label="↓" w={1} animal={props.animals["ArrowDown"]} />
        <Key label="→" w={1} animal={props.animals["ArrowRight"]} />
      </div>
    </div>
  );
}
