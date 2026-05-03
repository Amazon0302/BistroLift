import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, phone, tableId, restaurantId } = await req.json();

  if (!restaurantId) {
    return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: { name, phone, tableId, restaurantId },
  });

  return NextResponse.json(customer, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const customers = await prisma.customer.findMany({
    where: {
      restaurantId: restaurant.id,
      ...(from && to
        ? { visitedAt: { gte: new Date(from), lte: new Date(to) } }
        : {}),
    },
    include: { table: true },
    orderBy: { visitedAt: "desc" },
  });

  return NextResponse.json(customers);
}
