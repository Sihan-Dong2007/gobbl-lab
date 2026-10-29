import type { KnowledgeTopic } from "../types";
import { SCHOOL_VOUCHERS } from "./school-vouchers";
import { UNIVERSAL_HEALTHCARE } from "./universal-healthcare";

/** Every topic the prototype offers, in the order the picker shows them. Add new ones here. */
export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [SCHOOL_VOUCHERS, UNIVERSAL_HEALTHCARE];

export function getKnowledgeTopic(id: string | undefined): KnowledgeTopic | undefined {
  return KNOWLEDGE_TOPICS.find((t) => t.id === id);
}
