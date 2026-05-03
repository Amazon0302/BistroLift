import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUpsellSuggestions } from "@/lib/claude";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const suggestions = await prisma.upsellSuggestion.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(suggestions);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: {
        include: {
          items: { where: { isAvailable: true } },
        },
      },
    },
  });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const allItems = restaurant.categories.flatMap((cat) =>
    cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      badges: item.badges,
      category: cat.name,
    }))
  );

  if (allItems.length < 2) {
    return NextResponse.json({ error: "Need at least 2 menu items to generate suggestions" }, { status: 400 });
  }

  // Delete old pending suggestions before regenerating
  await prisma.upsellSuggestion.deleteMany({
    where: { restaurantId: restaurant.id, status: "pending" },
  });

  const suggestions = await generateUpsellSuggestions(restaurant.name, allItems);

  const created = await prisma.upsellSuggestion.createMany({
    data: suggestions.map((s) => ({
      restaurantId: restaurant.id,
      type: s.type,
      title: s.title,
      reasoning: s.reasoning,
      itemIds: s.itemIds,
      comboPrice: s.comboPrice ?? null,
      status: "pending",
    })),
  });

  return NextResponse.json({ generated: created.count });
}
