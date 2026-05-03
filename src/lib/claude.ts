import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type SuggestionType = "addon" | "combo" | "upgrade";

export interface UpsellSuggestionResult {
  type: SuggestionType;
  title: string;
  reasoning: string;  // sensory/emotional language shown to customers
  itemIds: string[];  // for upgrade: [baseItemId, premiumItemId]
  comboPrice?: number; // for combo: bundle price; for upgrade: price difference
}

interface MenuItemInput {
  id: string;
  name: string;
  description: string | null;
  price: number;
  badges: string[];
  category: string;
}

export async function generateUpsellSuggestions(
  restaurantName: string,
  items: MenuItemInput[]
): Promise<UpsellSuggestionResult[]> {
  const avgPrice = items.reduce((s, i) => s + i.price, 0) / items.length;
  const categories = [...new Set(items.map((i) => i.category))];

  const menuText = items
    .map(
      (i) =>
        `[${i.id}] ${i.name} | Category: ${i.category} | Price: $${i.price.toFixed(2)}${i.description ? ` | "${i.description}"` : ""}${i.badges.length ? ` | Tags: ${i.badges.join(", ")}` : ""}`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `You are a restaurant revenue optimization expert for "${restaurantName}". Your job is to maximize average order value using proven upselling psychology.

MENU (avg price: $${avgPrice.toFixed(2)}, categories: ${categories.join(", ")}):
${menuText}

Generate 8-12 high-impact suggestions using THREE strategy types:

**Strategy 1 — COMBO** (bundle 2-4 items at 12-18% discount)
- Bundle a main + side + drink, or appetizer + main
- comboPrice = sum × 0.85 (round to .99 or .49)
- Prioritize bundles that include a high-margin item (popular/chef tagged)

**Strategy 2 — ADDON** (pair two complementary items, no discount)
- Classic pairs: protein + sauce, main + drink, dessert after main
- Use sensory language in reasoning: textures, flavors, temperatures that contrast or complement
- Show the customer WHY these go together (not just "people like this")

**Strategy 3 — UPGRADE** (suggest premium version of a similar item)
- Find items that are clearly a "basic" vs "premium" version in the same category
- comboPrice = price DIFFERENCE between the two (the "upgrade fee")
- itemIds = [baseItemId, premiumItemId]
- Reasoning: what extra value the upgrade delivers

Rules:
- Only use IDs from the list above
- reasoning must use vivid, sensory or value-focused language (max 12 words)
- For combos: comboPrice must always be less than the sum of individual prices
- Include at least 2 combos, 3 addons, 1 upgrade
- Prioritize items with "popular" or "chef" badges in at least half the suggestions

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "type": "combo" | "addon" | "upgrade",
    "title": "catchy short name (max 5 words)",
    "reasoning": "vivid sensory pitch (max 12 words)",
    "itemIds": ["id1", "id2"],
    "comboPrice": 0.00
  }
]`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

  // Strip markdown fences if Claude wraps the response
  const raw = textBlock.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const suggestions: UpsellSuggestionResult[] = JSON.parse(raw);
  return suggestions;
}
