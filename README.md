# Gobbl Lab

A prototype for people who feel they don't know much about politics. It is a separate site from Gobbl: no login, no database, and nothing a visitor does is saved.

After two opening questions (confidence and willingness), there are two parts, and visitors can do either first or both:

- **Get to know the topic**: a plain explanation, how people see it, their own life, and a chat with a friendly AI guide.
- **Try saying it**: say one thing to an AI partner who has had a different experience. The partner doesn't try to change their mind.

The same two questions are asked again at the end, with a recap.

All wording is a draft and hasn't been reviewed.

## Run it

```bash
npm install
npm run dev
```

It works without an AI key; the guide and partner then reply with a placeholder. To use real replies, set `GROK_API_KEY` (see `.env.example`). The instructions the AI follows live on the server (`src/lib/knowledge/prompts.ts`, used by `src/app/api/chat/route.ts`), so a visitor's browser can't change them.

## Add a topic

Write a topic file like `src/lib/knowledge/topics/school-vouchers.ts` and register it in `src/lib/knowledge/topics/index.ts`. No component needs to change.

## Where things are

- `src/lib/knowledge/content.ts`: wording shared by every topic, and the two opening/closing questions
- `src/lib/knowledge/topics/`: wording for each topic
- `src/components/lab/KnowledgeFlow.tsx`: the whole flow
