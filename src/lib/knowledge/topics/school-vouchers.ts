import type { KnowledgeTopic } from "../types";

export const SCHOOL_VOUCHERS: KnowledgeTopic = {
  id: "school-vouchers",
  title: "School vouchers",
  blurb: "Should public money follow a student to a private school?",
  nameInSentence: "school vouchers",
  debateName: "school voucher debate",
  topicPreset: "School Choice & Vouchers — Should public funding follow students to private schools?",

  basics: {
    title: "The basics",
    sections: [
      {
        heading: "What it is",
        body: "A school voucher is money from the government that a family can put toward the cost of a school they choose for their child, including a private school, instead of that money going only to the public school the child would otherwise attend.",
      },
      {
        heading: "It varies",
        body: "Programs like this differ from place to place: who can get one, how much money it is, and which schools can take part.",
      },
      {
        heading: "The question",
        body: "The question people disagree about is whether public education money should work this way. It touches things people care about a lot, like what children need from their schools, what families can afford, and who gets to decide.",
      },
    ],
  },

  perspectives: {
    title: "Main perspectives",
    intro:
      "These are a few ways people tend to look at this question. Most people see some truth in more than one, and plenty of people's views don't fit neatly into any of them.",
    sections: [
      {
        heading: "Family choice",
        body: "Some people care most about parents being able to choose the school that fits their child. They see vouchers as a way to give every family, not only those who can afford private school, real options.",
      },
      {
        heading: "Strong public schools",
        body: "Some people care most about keeping public schools well funded and open to everyone. They worry that moving money away from public schools could leave the schools most children attend with less.",
      },
      {
        heading: "Standards and fairness",
        body: "Some people focus on the details: whether every school that receives public money meets the same standards, and whether all children, including those with special needs, are treated fairly wherever they go.",
      },
    ],
    outro: "There are also views that aren't on this list.",
  },

  life: {
    options: [
      "I went to a public school",
      "I went to a private or religious school",
      "I was homeschooled",
      "I went to a charter or magnet school, or one my family picked",
      "My family moved, or thought about moving, because of a school",
      "Someone close to me works in a school",
      "I have school-age kids, or help care for them",
      "School was hard for me or someone close to me (learning, safety, or fit)",
      "Money was a factor in where I or my family went to school",
    ],
  },

  matters: {
    prompt: "When you think about schools, what matters most to you?",
    max: 3,
    options: [
      "The quality of the teaching",
      "Safety",
      "Cost",
      "Distance and convenience",
      "The values and beliefs a school teaches",
      "Support for kids with special needs",
      "A mix of different kinds of students",
      "Having a say in which school a child goes to",
      "Something else",
    ],
  },
  mattersLabel: "schools",
};
