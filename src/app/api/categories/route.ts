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

  const { name, emoji } = await req.json();
  const count = await prisma.category.count({ where: { restaurantId: restaurant.id } });

  const category = await prisma.category.create({
    data: { name, emoji, order: count, restaurantId: restaurant.id },
    include: { items: true },
  });

  return NextResponse.json(category, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const { id, name, emoji, order } = await req.json();

  const category = await prisma.category.update({
    where: { id, restaurantId: restaurant.id },
    data: { name, emoji, order },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const { id } = await req.json();
  await prisma.category.delete({ where: { id, restaurantId: restaurant.id } });

  return NextResponse.json({ success: true });
}
