import type { ChoiceQuestion, KnowledgeTopic } from "./types";

/**
 * The wording that is the same for every topic. Wording that belongs to one topic lives in
 * its own file under topics/. ALL WORDING IS DRAFT and has not been reviewed.
 */

export const NONE_OF_THESE = "None of these really fit me";
export const GUIDE_NAME = "Your guide";
export const RESOURCES_FOOTNOTE = "Draft wording. Not yet reviewed.";

// ───────────────────────── Questions asked before and after ─────────────────────────

const AGREE = ["Strongly disagree", "Disagree", "Not sure", "Agree", "Strongly agree"];

/**
 * Asked at the start and again at the end, whichever parts they did, so the team can see what
 * changed. They are two different things: feeling you have something worth saying, and being
 * willing to say it to someone who sees it differently.
 */
export function measuresFor(topic: KnowledgeTopic): ChoiceQuestion[] {
  return [
    {
      key: "confidence",
      prompt: `In a conversation about ${topic.nameInSentence}, I feel I have something worth saying.`,
      options: AGREE,
    },
    {
      key: "willing",
      prompt: `If I had the chance, I'd be willing to talk about ${topic.nameInSentence} with someone who sees it differently.`,
      options: AGREE,
    },
  ];
}

export const MEASURE_SHORT: Record<string, string> = {
  confidence: "Having something worth saying",
  willing: "Willing to talk with someone who sees it differently",
};

// ───────────────────────── The two parts ─────────────────────────

export const HUB = {
  title: "What would you like to do?",
  intro: "Pick one to start. When you finish it, you can do the other one or wrap up.",
  parts: {
    know: {
      title: "Get to know the topic",
      body: "A plain explanation, how people see it, your own life, and a chat with a friendly guide.",
    },
    try: {
      title: "Try saying it",
      body: "Say one thing to someone who sees it a little differently. It's an AI, it won't push you, and you can stop any time.",
    },
    finish: { title: "Wrap up", body: "The same two questions again, then your recap." },
  },
  finishHint: "Do one of the two above first.",
  back: "Back to the two parts",
};

// ───────────────────────── Part one: the board ─────────────────────────

export const BOARD = {
  title: "Where do you want to start?",
  intro: "Do these in any order, and come back to any of them. There's no test and no wrong answers.",
  tiles: {
    basics: { title: "What's the issue?", body: "A quick, plain explanation." },
    perspectives: { title: "How people see it", body: "The main ways people look at the question." },
    life: { title: "Your own life", body: "Tell us what connects. A few minutes." },
    chat: { title: "Chat it through", body: "Talk with your guide. Start whenever you like." },
  },
  back: "Back to the board",
};

// ───────────────────────── Your life ─────────────────────────

export const LIFE = {
  prompt: "Which of these are part of your life, or the lives of people close to you?",
  help: "Pick all that apply. These are just starting points: any of them could be a way into this topic.",
  mattersHelp: "Pick up to three.",
};

export const STORY = {
  prompt: "Pick one thing you chose and tell us a little about it.",
  help: "A sentence or two is plenty. You can skip this.",
  placeholder: "For example: what happened, who was involved, how it felt…",
  maxLength: 600,
  skip: "Skip for now",
};

export const BRIDGE = {
  title: "Here's what you've told us",
  intro: "Your own life already touches this topic in these ways:",
  mattersIntro: "And these are the things you pay attention to:",
  storyIntro: "In your own words:",
  noConnections: "You said none of these really fit. That's fine, and the guide will start from there.",
  button: "Start the conversation",
  later: "Back to the board",
  outro: (topic: KnowledgeTopic) =>
    `People who disagree about ${topic.nameInSentence} often care about the same things you just picked. They just weigh them differently. Next, a friendly guide will chat with you about your experience. The guide isn't here to argue or to tell you what to think.`,
};

// ───────────────────────── The conversation ─────────────────────────

export const CHAT = {
  title: "A chat about your experience",
  waiting: "You can wrap up after a couple of messages.",
  again: "Chat again",
  continue: "Back to the board",
};

// ───────────────────────── Part two: try saying it ─────────────────────────

export const TRY = {
  sayTitle: "What's one thing you'd want to say?",
  chatTitle: "A short chat",
  sayHelp: "It can be something from your life or something you care about. It doesn't have to be an opinion, and it can be short.",
  placeholder: "For example: what happened, or what matters to you here…",
  starters: ["In my family…", "Something I've noticed is…", "What matters most to me here is…"],
  useEarlier: "Use what I wrote earlier",
  maxLength: 400,
  rulesTitle: "Before you start",
  yourLine: "What you want to say",
  rules: [
    "Your partner is an AI playing someone who has had a different experience of this topic.",
    "It won't try to change your mind, and it won't ask you to prove anything.",
    "You can say \"I'm not sure\" any time, and you can stop whenever you like.",
    "Nothing here is scored.",
  ],
  start: "Start",
  edit: "Change what I want to say",
  partnerName: "Your partner",
  helpersLabel: "Stuck? Try one of these",
  helpers: [
    "I'm not sure how to say this, but…",
    "I haven't thought about it much, but my experience was…",
    "I'm not sure what I think yet.",
    "Can you tell me more about what you mean?",
  ],
  waiting: "You can wrap up after a couple of messages.",
  wrapTitle: "What you just did",
  wrapNote: "Saying something to someone who sees it differently is the part many people find hard.",
  again: "Try again",
};

// ───────────────────────── Wrap-up ─────────────────────────

export const FINISH = {
  postIntro: "Almost done. The same two questions as at the start, so we can see if anything changed.",
};

export const FINAL_NOTE = {
  prompt: "Is there anything you'd like to say about how this went?",
  help: "Anything at all. You can skip this.",
  placeholder: "Whatever comes to mind…",
  maxLength: 500,
  skip: "Skip",
};

export const RECAP = {
  title: "Your recap",
  intro: "This is what you did and what you brought to the topic. Nothing here says what you should think.",
  doneNote: "Nothing in this session was saved.",
  again: "Start over",
  keepGoing: HUB.back,
};

export const HOME = {
  title: "Pick a topic",
  intro: "Each one works the same way. Start with whichever you're curious about.",
};
