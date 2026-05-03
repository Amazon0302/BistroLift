import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getRestaurant(userId: string) {
  return prisma.restaurant.findUnique({ where: { ownerId: userId } });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const { name, description, price, imageUrl, badges, categoryId, upsellIds } = await req.json();

  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat || cat.restaurantId !== restaurant.id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const count = await prisma.menuItem.count({ where: { categoryId } });

  const item = await prisma.menuItem.create({
    data: {
      name,
      description,
      price,
      imageUrl,
      badges: badges ?? [],
      upsellIds: upsellIds ?? [],
      order: count,
      categoryId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const { id, name, description, price, imageUrl, badges, isAvailable, categoryId, order, upsellIds } =
    await req.json();

  const item = await prisma.menuItem.update({
    where: { id },
    data: { name, description, price, imageUrl, badges, isAvailable, categoryId, order, upsellIds },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.menuItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
