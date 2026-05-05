import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type SuggestionType = "addon" | "combo" | "upgrade" | "special";

export interface UpsellSuggestionResult {
  type: SuggestionType;
  title: string;
  reasoning: string;
  itemIds: string[];
  comboPrice?: number;
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
  const highMarginItems = items.filter((i) =>
    i.badges.includes("popular") || i.badges.includes("chef")
  );

  const menuText = items
    .map(
      (i) =>
        `[${i.id}] ${i.name} | Cat: ${i.category} | $${i.price.toFixed(2)}${i.description ? ` | "${i.description}"` : ""}${i.badges.length ? ` | ★ ${i.badges.join(", ")}` : ""}`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `You are a world-class restaurant revenue strategist for "${restaurantName}". Use proven psychology and hospitality research to generate high-converting upsell offers that feel helpful, not pushy.

MENU (avg: $${avgPrice.toFixed(2)} | categories: ${categories.join(", ")} | high-margin items: ${highMarginItems.map((i) => i.name).join(", ") || "none tagged"}):
${menuText}

Generate 12–16 high-impact suggestions using FIVE proven strategies:

━━━ STRATEGY 1: COMBO — "Complete the Meal" Bundle ━━━
Research: 3-item cross-category bundles increase AOV 28% vs 2-item bundles.
- Bundle a STARTER + MAIN + DRINK or MAIN + SIDE + DESSERT (prefer 3 items, cross ≥2 categories)
- comboPrice = floor(sum × 0.82) + 0.99  (18% off, round to .99)
- title: "The [Adjective] Experience" / "Chef's Full Meal" / "The [Name] Feast"
- reasoning: paint a complete sensory picture of the meal ("Crispy starter, rich pasta, cool wine — the full Italian evening")
- Minimum 3 COMBO suggestions

━━━ STRATEGY 2: ADDON — Smart Sensory Pairing ━━━
Research: Social-proof pairings convert 22% better than generic "also try" messaging.
- Pair items with contrasting/complementary textures, temperatures, or flavours
- OR use social proof: "X in 10 guests who order [A] finish with [B]"
- NO discount — frame as curation, not deal
- reasoning format options:
  a) "[A]'s [quality] is cut perfectly by [B]'s [contrast]"
  b) "8 in 10 guests who order [A] also add [B]"
  c) "The [flavour] of [A] calls for [B] to balance it"
- Minimum 4 ADDON suggestions

━━━ STRATEGY 3: UPGRADE — The Better Version ━━━
Research: "Get more" framing outperforms "spend more" framing by 35%.
- Find a clear base→premium path within the same category (size, ingredient, preparation)
- comboPrice = price DIFFERENCE only (the "upgrade fee")
- itemIds = [baseItemId, premiumItemId]
- title: "Upgrade: [base] → [premium]"
- reasoning: name the specific extra value ("Adds truffle oil and shaved parmesan" not just "premium version")
- Upgrade fee must be ≤ 50% of base item price
- Minimum 2 UPGRADE suggestions

━━━ STRATEGY 4: SPECIAL — Featured Promotion ━━━
Research: A featured "story item" increases that item's orders by 30% and average ticket by 12%.
- Pick 1–2 high-margin items (prefer ★ popular or ★ chef badges)
- Craft a compelling narrative about WHY this item is special today
- comboPrice = item price × 0.90 (10% off as intro price) OR null for full-price feature
- type = "special"
- title: "Tonight: [Item Name]" or "Chef's Pick: [Item]"
- reasoning: the story (origin, technique, season, personal recommendation)
- Exactly 2 SPECIAL suggestions

━━━ STRATEGY 5: CART BOOSTER — Micro Add-On ━━━
Research: Items priced $4–$10 added to existing orders increase total ticket 15–20%.
- Find low-price items (under $12) that complement popular/chef items
- Frame as "just a little more makes it perfect"
- These are ADDON type but specifically chosen for their low barrier to add-on
- reasoning: "Just $X to make it perfect" / "The finishing touch for [X]"
- Minimum 2 CART BOOSTER (type = "addon")

━━━ RULES ━━━
- Only use exact IDs from the menu above
- reasoning = max 14 words, vivid and specific (no generic phrases like "great combination" or "pairs well")
- comboPrice for combos MUST be less than the sum of individual prices
- comboPrice for upgrades = the price DIFFERENCE (delta), not the full new price
- comboPrice for specials = discounted solo price OR omit for full price
- Prioritise items with ★ badges in ≥ 60% of suggestions
- No duplicate itemId pairs across suggestions of the same type

Return ONLY a valid JSON array, no markdown:
[{"type":"combo"|"addon"|"upgrade"|"special","title":"string","reasoning":"string","itemIds":["id1","id2"],"comboPrice":0.00}]`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

  const raw = textBlock.text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Claude returned non-array response");

  const suggestions = parsed as UpsellSuggestionResult[];
  return suggestions;
}
