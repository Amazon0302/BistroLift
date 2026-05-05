import { NextResponse } from "next/server";
import { anthropic } from "@/lib/claude";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let message: string;
  let history: Array<{ role: "user" | "assistant"; content: string }> = [];

  try {
    const body = await req.json();
    message = body.message?.trim();
    history = body.history ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          items: { where: { isAvailable: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const allItemIds = new Set(
    restaurant.categories.flatMap((c) => c.items.map((i) => i.id))
  );

  const menuContext = restaurant.categories.map((cat) => ({
    category: cat.name,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      price: Number(item.price),
      badges: item.badges,
      ingredients: (item.ingredients ?? []).slice(0, 6),
    })),
  }));

  const systemPrompt = `You are a warm, enthusiastic food assistant at ${restaurant.name}. Help customers find the perfect dish based on their mood, cravings, or dietary needs.

MENU:
${JSON.stringify(menuContext)}

RULES:
- Be conversational and enthusiastic (1–2 sentences max)
- Recommend 2–3 items that genuinely match the request
- Only recommend items that exist in the menu above (use exact IDs)
- Respond ONLY with valid JSON — no markdown, no extra text:

{"message":"your warm 1–2 sentence response","suggestions":[{"id":"exact-item-id","name":"exact item name","reason":"why it matches (max 8 words)"}]}`;

  const apiMessages = [
    ...history.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    });

    // Find the text block (adaptive thinking may add a thinking block first)
    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock?.type === "text" ? textBlock.text : "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: { message: string; suggestions: Array<{ id: string; name: string; reason: string }> };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { message: raw, suggestions: [] };
    }

    // Filter out any hallucinated item IDs
    parsed.suggestions = (parsed.suggestions ?? []).filter((s) =>
      allItemIds.has(s.id)
    );

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chat] Claude error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
