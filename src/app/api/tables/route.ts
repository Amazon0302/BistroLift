import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getRestaurant(userId: string) {
  return prisma.restaurant.findUnique({ where: { ownerId: userId } });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(tables);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const { number } = await req.json();

  const table = await prisma.table.create({
    data: { number, restaurantId: restaurant.id },
  });

  return NextResponse.json(table, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const { id } = await req.json();

  await prisma.table.delete({ where: { id, restaurantId: restaurant.id } });

  return NextResponse.json({ success: true });
}
