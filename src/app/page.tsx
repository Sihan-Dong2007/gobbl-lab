import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { HOME } from "@/lib/knowledge/content";
import { KNOWLEDGE_TOPICS } from "@/lib/knowledge/topics";

/** The first page: pick a topic. Each topic is its own page, so a link can go straight to one. */
export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">{HOME.title}</h1>
        <p className="mt-2 font-body text-base text-ink-soft">{HOME.intro}</p>
        <div className="mt-6 flex flex-col gap-3">
          {KNOWLEDGE_TOPICS.map((t) => (
            <Link
              key={t.id}
              href={`/${t.id}`}
              className="group flex items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-primary hover:shadow-soft"
            >
              <span>
                <span className="block font-display text-lg font-bold tracking-[-0.02em]">{t.title}</span>
                <span className="mt-0.5 block font-body text-sm text-ink-soft">{t.blurb}</span>
              </span>
              <Icon
                name="arrow-right"
                size={18}
                className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
        <p className="mt-8 font-body text-xs text-ink-muted">
          A prototype. The wording is a draft and hasn&apos;t been reviewed. Nothing you do here is saved.
        </p>
      </div>
    </div>
  );
}
