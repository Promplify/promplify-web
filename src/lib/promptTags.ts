export interface PromptTagLabel {
  id: string;
  name: string;
}

// Untyped PostgREST joins can infer arrays for a to-one tag relationship.
export const getRelatedTag = (relation: PromptTagLabel | PromptTagLabel[] | null | undefined): PromptTagLabel | null => {
  return Array.isArray(relation) ? (relation[0] ?? null) : (relation ?? null);
};
