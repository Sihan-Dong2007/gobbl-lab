"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { FlatTurkey } from "@/components/gamification/FlatTurkey";
import { LabChat, type ChatMsg } from "./LabChat";
import {
  BOARD,
  BRIDGE,
  CHAT,
  FINAL_NOTE,
  FINISH,
  GUIDE_NAME,
  HUB,
  LIFE,
  MEASURE_SHORT,
  NONE_OF_THESE,
  RECAP,
  STORY,
  TRY,
  measuresFor,
} from "@/lib/knowledge/content";
import type { KnowledgeTopic } from "@/lib/knowledge/types";
import { Board, type TileKey, type TileState } from "./Board";
import { OptionalNote, PickMany, QuestionSeries } from "./Choices";
import { Hub, type PartKey } from "./Hub";
import { BasicsBody, PerspectivesBody, ResourcePanel, type ResourceKey } from "./Resources";
import { Rules, Say, Wrap } from "./TryStep";

type View =
  | "pre"
  | "hub"
  | "board"
  | "basics"
  | "perspectives"
  | "life"
  | "chat"
  | "try"
  | "finish"
  | "recap";
type LifeStep = "life" | "matters" | "story" | "bridge";
type TryStep = "say" | "rules" | "chat" | "wrap";
type FinishStep = "post" | "final";

/** The views that belong to the first part, "Get to know the topic". */
const KNOW_VIEWS: View[] = ["board", "basics", "perspectives", "life", "chat"];

interface Visit {
  view: View;
  at: string;
}

interface Opened {
  resource: ResourceKey;
  at: string;
  view: View;
}

/**
 * The "help people who feel they don't know much about politics" prototype for one topic.
 *
 * Two questions open and close it (confidence and willingness, asked the same way both times).
 * In between there are two parts, and they can do either first, or both:
 *  - Get to know the topic: a board where they do things in whatever order they like (read the
 *    basics, read the main perspectives, tell us about their life, chat with a guide). The two
 *    readings also sit beside the other things, and the guide chat is kept when they step away.
 *  - Try saying it: say one thing to an AI partner who sees it a little differently.
 * Nothing is saved anywhere.
 */
export function KnowledgeFlow({ topic }: { topic: KnowledgeTopic }) {
  const measures = useMemo(() => measuresFor(topic), [topic]);

  const [runKey, setRunKey] = useState(0);
  const [view, setView] = useState<View>("pre");
  const [lifeStep, setLifeStep] = useState<LifeStep>("life");
  const [finishStep, setFinishStep] = useState<FinishStep>("post");

  const [pre, setPre] = useState<Record<string, string>>({});
  const [post, setPost] = useState<Record<string, string>>({});
  const [life, setLife] = useState<string[]>([]);
  const [matters, setMatters] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [finalNote, setFinalNote] = useState("");
  const [lifeDone, setLifeDone] = useState(false);
  const [finished, setFinished] = useState(false);

  const [visits, setVisits] = useState<Visit[]>([]);
  const [opens, setOpens] = useState<Opened[]>([]);

  const [chatOpened, setChatOpened] = useState(false);
  const [chatRun, setChatRun] = useState(0);
  /** Whether they'd told us about their life when this chat began (the opening depends on it). */
  const [chatHadLife, setChatHadLife] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatDone, setChatDone] = useState(false);

  const [tryStep, setTryStep] = useState<TryStep>("say");
  const [trySentence, setTrySentence] = useState("");
  const [tryOpened, setTryOpened] = useState(false);
  const [tryRun, setTryRun] = useState(0);
  const [tryChat, setTryChat] = useState<ChatMsg[]>([]);
  /** Stays true once they've finished a conversation, even if they go on to try again. */
  const [tryDone, setTryDone] = useState(false);

  const viewed: Record<ResourceKey, boolean> = {
    basics: visits.some((v) => v.view === "basics") || opens.some((o) => o.resource === "basics"),
    perspectives: visits.some((v) => v.view === "perspectives") || opens.some((o) => o.resource === "perspectives"),
  };

  // What the guide is told about this person; the server fills it into the prompt's {names}.
  // It updates as they add to it, so a chat already under way picks up later answers.
  const chatAnswers = useMemo(
    () => ({
      life_connections: life.length > 0 ? life.join("; ") : "(they haven't said yet)",
      matters_most: matters.length > 0 ? matters.join("; ") : "(they haven't said yet)",
      story_text: story.trim() || "(they haven't written anything)",
    }),
    [life, matters, story],
  );
  const partnerAnswers = useMemo(() => ({ their_sentence: trySentence.trim() }), [trySentence]);

  const knowDone = lifeDone || chatDone;
  const knowStarted = visits.some((v) => KNOW_VIEWS.includes(v.view));

  function go(next: View) {
    setView(next);
    setVisits((v) => [...v, { view: next, at: new Date().toISOString() }]);
  }

  // Each new screen, or step within one, starts at the top, so a long page doesn't leave them mid-way.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view, lifeStep, tryStep, finishStep]);

  function openTile(key: TileKey) {
    if (key === "basics") go("basics");
    else if (key === "perspectives") go("perspectives");
    else if (key === "life") {
      setLifeStep("life");
      go("life");
    } else if (key === "chat") {
      if (!chatOpened) {
        setChatOpened(true);
        setChatHadLife(lifeDone);
      }
      go("chat");
    }
  }

  function openPart(key: PartKey) {
    if (key === "know") go("board");
    else if (key === "try") go("try"); // the step is kept, so they come back to where they were
    else if (finished) {
      go("recap");
    } else {
      setFinishStep("post");
      go("finish");
    }
  }

  function newTry() {
    setTryChat([]);
    setTryOpened(false);
    setTryStep("say");
    setTryRun((r) => r + 1);
  }

  function newChat() {
    setChat([]);
    setChatDone(false);
    setChatHadLife(lifeDone);
    setChatRun((r) => r + 1);
  }

  function restart() {
    setView("pre");
    setLifeStep("life");
    setFinishStep("post");
    setPre({});
    setPost({});
    setLife([]);
    setMatters([]);
    setStory("");
    setFinalNote("");
    setLifeDone(false);
    setFinished(false);
    setVisits([]);
    setOpens([]);
    setChatOpened(false);
    setChatRun(0);
    setChatHadLife(false);
    setChat([]);
    setChatDone(false);
    setTryStep("say");
    setTrySentence("");
    setTryOpened(false);
    setTryRun(0);
    setTryChat([]);
    setTryDone(false);
    setRunKey((k) => k + 1);
  }

  const tiles: Record<TileKey, TileState> = {
    basics: viewed.basics ? { badge: "Read", done: true } : {},
    perspectives: viewed.perspectives ? { badge: "Read", done: true } : {},
    life: lifeDone ? { badge: "Done", done: true } : {},
    chat: chatDone ? { badge: "Done", done: true } : chatOpened ? { badge: "In progress" } : {},
  };

  const parts: Record<PartKey, TileState> = {
    know: knowDone ? { badge: "Done", done: true } : knowStarted ? { badge: "In progress" } : {},
    try: tryDone ? { badge: "Done", done: true } : tryOpened ? { badge: "In progress" } : {},
    finish: finished ? { badge: "Done", done: true } : { disabled: !(knowDone || tryDone) },
  };

  const showPanel = view === "life" || view === "chat";
  const backToBoard = (
    <button
      type="button"
      onClick={() => go("board")}
      className="mb-5 flex items-center gap-1.5 font-body text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
    >
      <Icon name="arrow-left" size={16} />
      {BOARD.back}
    </button>
  );

  const backToHub = (
    <button
      type="button"
      onClick={() => go("hub")}
      className="mb-5 flex items-center gap-1.5 font-body text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
    >
      <Icon name="arrow-left" size={16} />
      {HUB.back}
    </button>
  );

  let current: React.ReactNode = null;

  if (view === "pre") {
    current = (
      <>
        <div className="mb-8">
          <p className="font-body text-sm font-semibold text-primary">{topic.title}</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
            You may know more than you think.
          </h1>
          <p className="mt-3 font-body text-base text-ink-soft">
            First, two quick questions about where you are right now. There are no right answers.
          </p>
        </div>
        <QuestionSeries
          questions={measures}
          answers={pre}
          onAnswer={(k, v) => setPre((p) => ({ ...p, [k]: v }))}
          onComplete={() => go("hub")}
        />
      </>
    );
  } else if (view === "hub") {
    current = <Hub topic={topic} parts={parts} onOpen={openPart} />;
  } else if (view === "board") {
    current = <Board topic={topic} tiles={tiles} onOpen={openTile} onBack={() => go("hub")} />;
  } else if (view === "try" && tryStep !== "chat") {
    current = (
      <>
        {backToHub}
        {tryStep === "say" && (
          <Say
            value={trySentence}
            earlier={story.trim()}
            onChange={setTrySentence}
            onContinue={() => setTryStep("rules")}
          />
        )}
        {tryStep === "rules" && (
          <Rules
            sentence={trySentence}
            onStart={() => {
              setTryOpened(true);
              setTryStep("chat");
            }}
            onEdit={() => setTryStep("say")}
          />
        )}
        {tryStep === "wrap" && <Wrap chat={tryChat} onBack={() => go("hub")} onAgain={newTry} />}
      </>
    );
  } else if (view === "basics" || view === "perspectives") {
    const isBasics = view === "basics";
    current = (
      <div className="animate-slide-up">
        {backToBoard}
        <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">
            {isBasics ? topic.basics.title : topic.perspectives.title}
          </h2>
          <div className="mt-4">{isBasics ? <BasicsBody topic={topic} /> : <PerspectivesBody topic={topic} />}</div>
        </section>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => go("board")}>{BOARD.back}</Button>
          <Button variant="outline" onClick={() => openTile(isBasics ? "perspectives" : "basics")}>
            {isBasics ? "See how people look at it" : "Read the basics"}
          </Button>
        </div>
      </div>
    );
  } else if (view === "life") {
    current = (
      <>
        {backToBoard}
        {lifeStep === "life" && (
          <PickMany
            prompt={LIFE.prompt}
            help={LIFE.help}
            options={[...topic.life.options, NONE_OF_THESE]}
            exclusive={NONE_OF_THESE}
            value={life}
            onChange={setLife}
            onContinue={() => setLifeStep("matters")}
          />
        )}
        {lifeStep === "matters" && (
          <>
            <StepBack onClick={() => setLifeStep("life")} />
            <PickMany
              prompt={topic.matters.prompt}
              help={LIFE.mattersHelp}
              options={topic.matters.options}
              max={topic.matters.max}
              value={matters}
              onChange={setMatters}
              onContinue={() => setLifeStep("story")}
            />
          </>
        )}
        {lifeStep === "story" && (
          <>
            <StepBack onClick={() => setLifeStep("matters")} />
            <OptionalNote
              prompt={STORY.prompt}
              help={STORY.help}
              placeholder={STORY.placeholder}
              maxLength={STORY.maxLength}
              skipLabel={STORY.skip}
              value={story}
              onChange={setStory}
              onContinue={() => {
                setLifeDone(true);
                setLifeStep("bridge");
              }}
              onSkip={() => {
                setStory("");
                setLifeDone(true);
                setLifeStep("bridge");
              }}
            />
          </>
        )}
        {lifeStep === "bridge" && (
          <Bridge
            topic={topic}
            life={life}
            matters={matters}
            story={story}
            onChat={() => openTile("chat")}
            onBoard={() => go("board")}
          />
        )}
      </>
    );
  } else if (view === "finish") {
    current = (
      <>
        {backToHub}
        {finishStep === "post" && (
          <>
            <p className="mb-5 font-body text-sm text-ink-soft">{FINISH.postIntro}</p>
            <QuestionSeries
              questions={measures}
              answers={post}
              onAnswer={(k, v) => setPost((p) => ({ ...p, [k]: v }))}
              onComplete={() => setFinishStep("final")}
            />
          </>
        )}
        {finishStep === "final" && (
          <OptionalNote
            prompt={FINAL_NOTE.prompt}
            help={FINAL_NOTE.help}
            placeholder={FINAL_NOTE.placeholder}
            maxLength={FINAL_NOTE.maxLength}
            skipLabel={FINAL_NOTE.skip}
            value={finalNote}
            onChange={setFinalNote}
            onContinue={() => {
              setFinished(true);
              go("recap");
            }}
            onSkip={() => {
              setFinalNote("");
              setFinished(true);
              go("recap");
            }}
          />
        )}
      </>
    );
  } else if (view === "recap") {
    current = (
      <Recap
        topic={topic}
        measures={measures}
        life={life}
        matters={matters}
        story={story}
        finalNote={finalNote}
        pre={pre}
        post={post}
        visits={visits}
        opens={opens}
        chat={chat}
        knowDone={knowDone}
        tryDone={tryDone}
        trySentence={trySentence}
        tryChat={tryChat}
        onBoard={() => go("hub")}
        onRestart={restart}
      />
    );
  }

  return (
    <div key={runKey} className="mx-auto w-full max-w-4xl">
      <div className={showPanel ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}>
        <div className="min-w-0 max-w-2xl">
          {/* The chat stays mounted once started, so stepping away to read something doesn't lose it. */}
          {view !== "chat" && !(view === "try" && tryStep === "chat") && <div key={view}>{current}</div>}
          {chatOpened && (
            <div className={view === "chat" ? "animate-slide-up" : "hidden"}>
              {backToBoard}
              <h2 className="mb-3 font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">
                {CHAT.title}
              </h2>
              <div className="h-[32rem]">
                <LabChat
                  key={chatRun}
                  kind="guide"
                  topicId={topic.id}
                  hasLife={chatHadLife}
                  answers={chatAnswers}
                  maxTurns={6}
                  name={GUIDE_NAME}
                  avatar={<FlatTurkey stage={5} size={22} />}
                  onMessagesChange={setChat}
                  onFinish={() => setChatDone(true)}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {chatDone ? (
                  <>
                    <Button onClick={() => go("board")}>{BOARD.back}</Button>
                    <Button variant="outline" onClick={newChat}>
                      {CHAT.again}
                    </Button>
                  </>
                ) : (
                  <span className="font-body text-xs text-ink-muted">{CHAT.waiting}</span>
                )}
              </div>
            </div>
          )}
          {tryOpened && (
            <div className={view === "try" && tryStep === "chat" ? "animate-slide-up" : "hidden"}>
              {backToHub}
              <h2 className="mb-3 font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">
                {TRY.chatTitle}
              </h2>
              <div className="h-[32rem]">
                <LabChat
                  key={tryRun}
                  kind="partner"
                  topicId={topic.id}
                  answers={partnerAnswers}
                  maxTurns={3}
                  name={TRY.partnerName}
                  initialInput={trySentence.trim()}
                  helpers={TRY.helpers}
                  helpersLabel={TRY.helpersLabel}
                  onMessagesChange={setTryChat}
                  onFinish={() => {
                    setTryDone(true);
                    setTryStep("wrap");
                  }}
                />
              </div>
              <p className="mt-4 font-body text-xs text-ink-muted">{TRY.waiting}</p>
            </div>
          )}
        </div>
        {showPanel && (
          <ResourcePanel
            topic={topic}
            viewed={viewed}
            onOpen={(resource) => setOpens((o) => [...o, { resource, at: new Date().toISOString(), view }])}
          />
        )}
      </div>
    </div>
  );
}

function StepBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 flex items-center gap-1 font-body text-sm text-ink-muted hover:text-ink"
    >
      <Icon name="arrow-left" size={14} />
      Previous
    </button>
  );
}

/** A tag that just shows something they picked. Uses the app's own chip, but it isn't a button here. */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <Chip
      disabled
      tabIndex={-1}
      aria-pressed={undefined}
      className="!h-auto cursor-default !whitespace-normal py-1.5 text-left disabled:opacity-100"
    >
      {children}
    </Chip>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}

function Bridge({
  topic,
  life,
  matters,
  story,
  onChat,
  onBoard,
}: {
  topic: KnowledgeTopic;
  life: string[];
  matters: string[];
  story: string;
  onChat: () => void;
  onBoard: () => void;
}) {
  const connections = life.filter((l) => l !== NONE_OF_THESE);
  return (
    <div className="animate-slide-up">
      <h2 className="font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">{BRIDGE.title}</h2>
      <div className="mt-5 flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        {connections.length > 0 ? (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">{BRIDGE.intro}</p>
            <Tags items={connections} />
          </div>
        ) : (
          <p className="font-body text-sm text-ink-soft">{BRIDGE.noConnections}</p>
        )}
        {matters.length > 0 && (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">{BRIDGE.mattersIntro}</p>
            <Tags items={matters} />
          </div>
        )}
        {story.trim() && (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">{BRIDGE.storyIntro}</p>
            <blockquote className="border-l-4 border-primary/40 pl-3 font-body text-sm italic text-ink-soft">
              {story.trim()}
            </blockquote>
          </div>
        )}
      </div>
      <p className="mt-5 font-body text-sm text-ink-soft">{BRIDGE.outro(topic)}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" onClick={onChat}>
          {BRIDGE.button}
          <Icon name="arrow-right" size={18} />
        </Button>
        <Button size="lg" variant="outline" onClick={onBoard}>
          {BRIDGE.later}
        </Button>
      </div>
    </div>
  );
}

function Recap({
  topic,
  measures,
  life,
  matters,
  story,
  finalNote,
  pre,
  post,
  visits,
  opens,
  chat,
  knowDone,
  tryDone,
  trySentence,
  tryChat,
  onBoard,
  onRestart,
}: {
  topic: KnowledgeTopic;
  measures: { key: string }[];
  life: string[];
  matters: string[];
  story: string;
  finalNote: string;
  pre: Record<string, string>;
  post: Record<string, string>;
  visits: Visit[];
  opens: Opened[];
  chat: ChatMsg[];
  knowDone: boolean;
  tryDone: boolean;
  trySentence: string;
  tryChat: ChatMsg[];
  onBoard: () => void;
  onRestart: () => void;
}) {
  const [showData, setShowData] = useState(false);
  const connections = life.filter((l) => l !== NONE_OF_THESE);
  const recorded = {
    topic: topic.id,
    partsFinished: { getToKnowTheTopic: knowDone, trySayingIt: tryDone },
    screensVisited: visits,
    openedBesideOtherThings: opens,
    before: pre,
    after: post,
    life,
    matters,
    story: story.trim() || null,
    finalNote: finalNote.trim() || null,
    chatMessagesFromLearner: chat.filter((m) => m.role === "user").length,
    saidToPartner: trySentence.trim() || null,
    partnerMessagesFromLearner: tryChat.filter((m) => m.role === "user").length,
  };
  const didParts = [knowDone && HUB.parts.know.title, tryDone && HUB.parts.try.title].filter(Boolean) as string[];

  return (
    <div className="animate-slide-up">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
        <FlatTurkey stage={5} size={40} />
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.03em]">{RECAP.title}</h2>
      <p className="mt-2 font-body text-sm text-ink-soft">{RECAP.intro}</p>

      <div className="mt-6 flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        {didParts.length > 0 && (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">What you did</p>
            <p className="font-body text-sm text-ink-soft">{didParts.join(" and ")}</p>
          </div>
        )}
        {trySentence.trim() && (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">{TRY.yourLine}</p>
            <blockquote className="border-l-4 border-primary/40 pl-3 font-body text-sm italic text-ink-soft">
              {trySentence.trim()}
            </blockquote>
          </div>
        )}
        {connections.length > 0 && (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">Parts of your life that touch this topic</p>
            <Tags items={connections} />
          </div>
        )}
        {matters.length > 0 && (
          <div>
            <p className="mb-2 font-body text-sm font-semibold">What you&apos;d pay attention to</p>
            <Tags items={matters} />
          </div>
        )}
        {(story.trim() || finalNote.trim()) && (
          <div className="flex flex-col gap-3">
            {story.trim() && (
              <blockquote className="border-l-4 border-primary/40 pl-3 font-body text-sm italic text-ink-soft">
                {story.trim()}
              </blockquote>
            )}
            {finalNote.trim() && (
              <blockquote className="border-l-4 border-primary/40 pl-3 font-body text-sm italic text-ink-soft">
                {finalNote.trim()}
              </blockquote>
            )}
          </div>
        )}
      </div>

      <section className="mt-5 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <h3 className="font-display text-base font-bold">Before and after</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {measures.map((m) => (
            <li key={m.key} className="font-body text-sm">
              <div className="font-semibold">{MEASURE_SHORT[m.key] ?? m.key}</div>
              <div className="text-ink-soft">
                {pre[m.key] ?? "no answer"} <span className="text-ink-muted">→</span> {post[m.key] ?? "no answer"}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowData((s) => !s)}
          className="flex items-center gap-1.5 font-body text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <Icon name="chevron-down" size={14} className={showData ? "rotate-180" : ""} />
          For the team: what this run recorded
        </button>
        {showData && (
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-surface-2 p-3 font-mono text-xs text-ink-soft">
            {JSON.stringify(recorded, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onBoard}>{RECAP.keepGoing}</Button>
        <Button variant="outline" onClick={onRestart}>
          {RECAP.again}
        </Button>
        <span className="font-body text-xs text-ink-muted">{RECAP.doneNote}</span>
      </div>
    </div>
  );
}
