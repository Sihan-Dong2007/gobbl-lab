"use client";

import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { FlatTurkey } from "@/components/gamification/FlatTurkey";
import { BOARD, HUB } from "@/lib/knowledge/content";
import type { KnowledgeTopic } from "@/lib/knowledge/types";

export type TileKey = "basics" | "perspectives" | "life" | "chat";

export interface TileState {
  /** Shown as a small badge, e.g. "Read" or "Done". Nothing if they haven't started. */
  badge?: string;
  /** Finished, so the badge is green. */
  done?: boolean;
  disabled?: boolean;
}

const ICONS: Record<Exclude<TileKey, "chat">, IconName> = {
  basics: "skills",
  perspectives: "flock",
  life: "profile",
};

/** A big button with an icon, a title and a line of text. Used on the board and on the start page. */
export function Tile({
  title,
  body,
  icon,
  state,
  onClick,
  wide,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  state: TileState;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={state.disabled}
      onClick={onClick}
      className={`group flex items-start gap-4 rounded-3xl border border-line bg-surface p-5 text-left transition-[border-color,box-shadow] hover:border-primary hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line disabled:hover:shadow-none ${
        wide ? "w-full" : ""
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-gobbl-700">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-lg font-bold tracking-[-0.02em]">{title}</span>
          {state.badge && (
            <Badge tone={state.done ? "forest" : "ochre"} variant="soft">
              {state.badge}
            </Badge>
          )}
        </span>
        <span className="mt-0.5 block font-body text-sm text-ink-soft">{body}</span>
      </span>
      <Icon
        name="arrow-right"
        size={18}
        className="mt-1 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-disabled:hidden"
      />
    </button>
  );
}

/**
 * Where the learner chooses what to do next within the first part. Everything is open from
 * here and they can come back after each one, so nobody is walked through in a fixed order.
 */
export function Board({
  topic,
  tiles,
  onOpen,
  onBack,
}: {
  topic: KnowledgeTopic;
  tiles: Record<TileKey, TileState>;
  onOpen: (key: TileKey) => void;
  onBack: () => void;
}) {
  const order: TileKey[] = ["basics", "perspectives", "life", "chat"];

  return (
    <div className="animate-slide-up">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 font-body text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <Icon name="arrow-left" size={16} />
        {HUB.back}
      </button>
      <p className="font-body text-sm font-semibold text-primary">{topic.title}</p>
      <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
        {BOARD.title}
      </h1>
      <p className="mt-2 font-body text-base text-ink-soft">{BOARD.intro}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {order.map((key) => (
          <Tile
            key={key}
            title={BOARD.tiles[key].title}
            body={BOARD.tiles[key].body}
            icon={key === "chat" ? <FlatTurkey stage={5} size={40} /> : <Icon name={ICONS[key]} size={22} />}
            state={tiles[key]}
            onClick={() => onOpen(key)}
          />
        ))}
      </div>
    </div>
  );
}
