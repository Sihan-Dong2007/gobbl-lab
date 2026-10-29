"use client";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { ChatMsg } from "./LabChat";
import { HUB, TRY } from "@/lib/knowledge/content";

/** Choosing the one thing they'd like to say. Short on purpose; it can be a feeling or an experience. */
export function Say({
  value,
  earlier,
  onChange,
  onContinue,
}: {
  value: string;
  /** What they wrote in the first part, if anything, so they don't have to write it twice. */
  earlier: string;
  onChange: (next: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="animate-slide-up">
      <h2 className="font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">{TRY.sayTitle}</h2>
      <p className="mt-1.5 font-body text-sm text-ink-soft">{TRY.sayHelp}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TRY.starters.map((s) => (
          <Chip key={s} onClick={() => onChange(value.trim() ? value : s)}>
            {s}
          </Chip>
        ))}
        {earlier && <Chip onClick={() => onChange(earlier)}>{TRY.useEarlier}</Chip>}
      </div>
      <textarea
        value={value}
        rows={4}
        maxLength={TRY.maxLength}
        placeholder={TRY.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 font-body text-sm text-ink focus:border-primary focus:outline-none"
      />
      <div className="mt-1 text-right font-body text-xs text-ink-muted">
        {value.length}/{TRY.maxLength}
      </div>
      <div className="mt-4">
        <Button disabled={value.trim().length === 0} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/** What to expect, said plainly before they begin. */
export function Rules({
  sentence,
  onStart,
  onEdit,
}: {
  sentence: string;
  onStart: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="animate-slide-up">
      <h2 className="font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">{TRY.rulesTitle}</h2>
      <div className="mt-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <p className="mb-2 font-body text-sm font-semibold">{TRY.yourLine}</p>
        <blockquote className="border-l-4 border-primary/40 pl-3 font-body text-sm italic text-ink-soft">
          {sentence.trim()}
        </blockquote>
        <ul className="mt-5 flex flex-col gap-2.5">
          {TRY.rules.map((r) => (
            <li key={r} className="flex items-start gap-2.5 font-body text-sm text-ink-soft">
              <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onStart}>
          {TRY.start}
          <Icon name="arrow-right" size={18} />
        </Button>
        <Button size="lg" variant="outline" onClick={onEdit}>
          {TRY.edit}
        </Button>
      </div>
    </div>
  );
}

/**
 * What they did, said back as plain facts that can be counted from the conversation.
 * Nothing here judges how it went.
 */
export function Wrap({
  chat,
  onBack,
  onAgain,
}: {
  chat: ChatMsg[];
  onBack: () => void;
  onAgain: () => void;
}) {
  const mine = chat.filter((m) => m.role === "user");
  const facts: string[] = [];
  if (mine.length > 0) facts.push("You said something in your own words to someone who might see it differently.");
  if (mine.length > 1) facts.push(`You kept the conversation going for ${mine.length} messages.`);
  if (mine.some((m) => m.content.includes("?"))) facts.push("You asked the other person a question.");

  return (
    <div className="animate-slide-up">
      <h2 className="font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">{TRY.wrapTitle}</h2>
      <div className="mt-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <ul className="flex flex-col gap-2.5">
          {facts.map((f) => (
            <li key={f} className="flex items-start gap-2.5 font-body text-sm text-ink-soft">
              <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-body text-sm text-ink-soft">{TRY.wrapNote}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onBack}>{HUB.back}</Button>
        <Button variant="outline" onClick={onAgain}>
          {TRY.again}
        </Button>
      </div>
    </div>
  );
}
