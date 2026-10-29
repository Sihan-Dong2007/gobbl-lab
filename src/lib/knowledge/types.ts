export interface ChoiceQuestion {
  key: string;
  prompt: string;
  options: string[];
}

export interface ResourceSection {
  heading: string;
  body: string;
}

/**
 * Everything about one topic that the prototype shows or says. To add a topic, write one of
 * these (see topics/) and register it in topics/index.ts: no component needs to change.
 *
 * ALL WORDING IS DRAFT. It is meant to be neutral, but nobody on the poli-sci side has
 * reviewed it yet.
 */
export interface KnowledgeTopic {
  /** Used in the URL: /lab/knowledge?topic=<id>. */
  id: string;
  /** Short title, e.g. "School vouchers". */
  title: string;
  /** One line shown on the topic picker. */
  blurb: string;
  /** How the topic reads inside a sentence, e.g. "school vouchers". */
  nameInSentence: string;
  /** What the debate is called, e.g. "school voucher debate". */
  debateName: string;
  /** The topic string the AI chat endpoint expects (same shape as Gobbl's own topics). */
  topicPreset: string;

  basics: { title: string; sections: ResourceSection[] };
  perspectives: { title: string; intro: string; sections: ResourceSection[]; outro: string };

  life: { options: string[] };
  matters: { prompt: string; options: string[]; max: number };
  /** Finishes "what matters most when they think about ___", for the guide's notes. */
  mattersLabel: string;
}
