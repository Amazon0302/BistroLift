import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MenuPage from "@/components/menu/MenuPage";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

export default async function PublicMenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { table: tableId } = await searchParams;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { order: "asc" },
          },
        },
      },
      upsellSuggestions: {
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!restaurant) notFound();

  // Record a scan (anonymous visit) — fire and forget
  if (tableId) {
    prisma.customer
      .create({
        data: {
          restaurantId: restaurant.id,
          tableId: tableId ?? undefined,
        },
      })
      .catch(() => {});
  }

  const allItems = restaurant.categories.flatMap((c) => c.items);
  const itemMap = Object.fromEntries(
    allItems.map((i) => [i.id, { id: i.id, name: i.name, price: Number(i.price), imageUrl: i.imageUrl }])
  );

  const approvedSuggestions = restaurant.upsellSuggestions.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title,
    reasoning: s.reasoning,
    items: s.itemIds.map((id) => itemMap[id]).filter((x): x is NonNullable<typeof x> => Boolean(x)),
    comboPrice: s.comboPrice ? Number(s.comboPrice) : null,
  }));

  return (
    <MenuPage
      restaurant={{
        id: restaurant.id,
        name: restaurant.name,
        logoUrl: restaurant.logoUrl,
        coverUrl: restaurant.coverUrl,
        description: restaurant.description,
        themeColor: restaurant.themeColor,
        discountText: restaurant.discountText,
      }}
      categories={restaurant.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        items: cat.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          imageUrl: item.imageUrl,
          badges: item.badges,
          ingredients: item.ingredients,
          upsellIds: item.upsellIds,
        })),
      }))}
      approvedSuggestions={approvedSuggestions}
      tableId={tableId}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  return {
    title: restaurant ? `${restaurant.name} — Menu` : "Menu",
  };
}
