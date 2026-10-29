import type { KnowledgeTopic } from "../types";

export const UNIVERSAL_HEALTHCARE: KnowledgeTopic = {
  id: "universal-healthcare",
  title: "Universal healthcare",
  blurb: "Should one public program cover everyone's healthcare?",
  nameInSentence: "universal healthcare",
  debateName: "healthcare debate",
  topicPreset: "Universal Healthcare — Should the US adopt a single-payer healthcare system?",

  basics: {
    title: "The basics",
    sections: [
      {
        heading: "What it is",
        body: "In a single-payer system, one government program pays for most healthcare, instead of many different insurance companies. Doctors and hospitals can still be private. The difference is who pays the bills.",
      },
      {
        heading: "It varies",
        body: "Countries that do something like this do it in different ways: what's covered, how it's paid for, and whether private insurance still exists alongside it.",
      },
      {
        heading: "The question",
        body: "In the US today, people get coverage through a mix of jobs, private plans, and government programs. The question people disagree about is whether to move to a single public program or keep and improve the current mix. It touches things people care about a lot, like cost, choosing your own doctor, and who is responsible for making sure people can get care.",
      },
    ],
  },

  perspectives: {
    title: "Main perspectives",
    intro:
      "These are a few ways people tend to look at this question. Most people see some truth in more than one, and plenty of people's views don't fit neatly into any of them.",
    sections: [
      {
        heading: "Everyone covered",
        body: "Some people care most about making sure everyone can get care no matter their job or income. They see one public program as the simplest way to make that happen.",
      },
      {
        heading: "Choice and control",
        body: "Some people care most about being able to choose their own insurance and doctors, and about government not making healthcare decisions. They worry that a single program would limit those choices.",
      },
      {
        heading: "Cost and how it would work",
        body: "Some people focus on the practical questions: what it would cost, who would pay, how long people might wait for care, and whether quality would change.",
      },
    ],
    outro: "There are also views that aren't on this list.",
  },

  life: {
    options: [
      "I've had health insurance through my own job or a family member's",
      "I've gone without health insurance, or someone close to me has",
      "I've been surprised by a medical bill",
      "I or someone close to me has a long-term health condition",
      "I've put off or skipped care because of the cost",
      "Someone close to me works in healthcare",
      "I've used a public program like Medicaid or Medicare",
      "I've received healthcare in another country",
      "I've helped take care of someone who was sick or elderly",
    ],
  },

  matters: {
    prompt: "When you think about healthcare, what matters most to you?",
    max: 3,
    options: [
      "Cost",
      "Quality of care",
      "Choosing my own doctor",
      "Not waiting long to be seen",
      "Coverage that doesn't depend on a job",
      "Coverage for conditions I already have",
      "Less paperwork",
      "Having a say in how it's run",
      "Something else",
    ],
  },
  mattersLabel: "healthcare",
};
