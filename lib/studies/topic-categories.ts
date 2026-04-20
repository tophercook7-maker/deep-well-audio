export { STUDIES_HUB_CATEGORY_LABELS, STUDIES_HUB_CATEGORY_ORDER, STUDIES_HUB_CATEGORY_TOPICS } from "@/lib/studies/hub-categories";
import type { StudiesHubCategorySlug } from "@/lib/studies/topic-types";
import { getTopicEngine } from "@/lib/studies/topic-engine";

/** Hub browse categories for a topic (from the topic engine). */
export function hubCategoriesForTopicSlug(slug: string): StudiesHubCategorySlug[] {
  return getTopicEngine(slug)?.hubCategories ?? [];
}
