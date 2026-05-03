import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MenuBuilder from "@/components/dashboard/MenuBuilder";

export default async function MenuPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!restaurant) redirect("/login");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Menu Builder</h2>
        <p className="text-zinc-400 mt-1">Manage your categories and menu items</p>
      </div>
      <MenuBuilder
        restaurantId={restaurant.id}
        initialCategories={restaurant.categories.map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          order: c.order,
          items: c.items.map((i) => ({
            id: i.id,
            name: i.name,
            description: i.description,
            price: Number(i.price),
            imageUrl: i.imageUrl,
            badges: i.badges,
            isAvailable: i.isAvailable,
            categoryId: i.categoryId,
            order: i.order,
            upsellIds: i.upsellIds,
          })),
        }))}
      />
    </div>
  );
}
