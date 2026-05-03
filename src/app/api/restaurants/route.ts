import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name, restaurantName, slug } = body;

  if (!email || !password || !restaurantName || !slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const slugExists = await prisma.restaurant.findUnique({ where: { slug } });
  if (slugExists) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      restaurant: {
        create: {
          name: restaurantName,
          slug: slug.toLowerCase().replace(/\s+/g, "-"),
        },
      },
    },
    include: { restaurant: true },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          items: { orderBy: { order: "asc" } },
        },
      },
      tables: { orderBy: { number: "asc" } },
    },
  });

  return NextResponse.json(restaurant);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, googleReviewLink, themeColor, discountText, logoUrl, coverUrl } = body;

  const restaurant = await prisma.restaurant.update({
    where: { ownerId: session.user.id },
    data: { name, description, googleReviewLink, themeColor, discountText, logoUrl, coverUrl },
  });

  return NextResponse.json(restaurant);
}
