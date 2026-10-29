import { notFound } from "next/navigation";
import { KnowledgeFlow } from "@/components/lab/KnowledgeFlow";
import { getKnowledgeTopic } from "@/lib/knowledge/topics";

export default function TopicPage({ params }: { params: { topic: string } }) {
  const topic = getKnowledgeTopic(params.topic);
  if (!topic) notFound();
  return <KnowledgeFlow key={topic.id} topic={topic} />;
}
