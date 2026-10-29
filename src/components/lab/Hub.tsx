"use client";

import { Icon } from "@/components/ui/Icon";
import { HUB } from "@/lib/knowledge/content";
import type { KnowledgeTopic } from "@/lib/knowledge/types";
import { Tile, type TileState } from "./Board";

export type PartKey = "know" | "try" | "finish";

/**
 * The first thing they see after the opening questions: the two parts they can do, and a way
 * to wrap up once they've done one. They can do either first, or both.
 */
export function Hub({
  topic,
  parts,
  onOpen,
}: {
  topic: KnowledgeTopic;
  parts: Record<PartKey, TileState>;
  onOpen: (key: PartKey) => void;
}) {
  const icons: Record<PartKey, React.ReactNode> = {
    know: <Icon name="skills" size={22} />,
    try: <Icon name="debate" size={22} />,
    finish: <Icon name="check" size={22} />,
  };

  return (
    <div className="animate-slide-up">
      <p className="font-body text-sm font-semibold text-primary">{topic.title}</p>
      <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
        {HUB.title}
      </h1>
      <p className="mt-2 font-body text-base text-ink-soft">{HUB.intro}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(["know", "try"] as const).map((key) => (
          <Tile
            key={key}
            title={HUB.parts[key].title}
            body={HUB.parts[key].body}
            icon={icons[key]}
            state={parts[key]}
            onClick={() => onOpen(key)}
          />
        ))}
      </div>
      <div className="mt-3">
        <Tile
          wide
          title={HUB.parts.finish.title}
          body={parts.finish.disabled ? HUB.finishHint : HUB.parts.finish.body}
          icon={icons.finish}
          state={parts.finish}
          onClick={() => onOpen("finish")}
        />
      </div>
    </div>
  );
}
