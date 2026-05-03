import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SuggestionsClient from "./SuggestionsClient";

export default async function SuggestionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      upsellSuggestions: { orderBy: { createdAt: "desc" } },
      categories: { include: { items: true } },
    },
  });
  if (!restaurant) redirect("/dashboard/settings");

  // Map item id → { name, price }
  const itemMap: Record<string, { name: string; price: number }> = {};
  restaurant.categories.forEach((cat) =>
    cat.items.forEach((item) => {
      itemMap[item.id] = { name: item.name, price: Number(item.price) };
    })
  );

  const suggestions = restaurant.upsellSuggestions.map((s) => {
    const itemDetails = s.itemIds.map((id) => itemMap[id] ?? { name: id, price: 0 });
    const originalTotal = itemDetails.reduce((sum, i) => sum + i.price, 0);
    return {
      id: s.id,
      type: s.type,
      title: s.title,
      reasoning: s.reasoning,
      itemNames: itemDetails.map((i) => i.name),
      itemPrices: itemDetails.map((i) => i.price),
      originalTotal,
      comboPrice: s.comboPrice ? Number(s.comboPrice) : null,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    };
  });

  return <SuggestionsClient suggestions={suggestions} />;
}
