import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DURATION_HOURS: Record<string, number> = {
  "1d": 24,
  "3d": 72,
  "7d": 168,
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    status: "approved" | "rejected";
    comboPrice?: number;
    offerDuration?: "1d" | "3d" | "7d" | "never";
  };
  const { status, comboPrice, offerDuration } = body;

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (comboPrice !== undefined && (typeof comboPrice !== "number" || comboPrice <= 0)) {
    return NextResponse.json({ error: "Invalid comboPrice" }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const suggestion = await prisma.upsellSuggestion.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let offerEndsAt: Date | null | undefined = undefined;
  if (status === "approved" && offerDuration && offerDuration !== "never") {
    const hours = DURATION_HOURS[offerDuration];
    if (hours) offerEndsAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  } else if (status === "approved") {
    offerEndsAt = null; // always active
  }

  const updated = await prisma.upsellSuggestion.update({
    where: { id },
    data: {
      status,
      reviewedAt: new Date(),
      ...(comboPrice !== undefined ? { comboPrice } : {}),
      ...(offerEndsAt !== undefined ? { offerEndsAt } : {}),
    },
  });

  return NextResponse.json(updated);
}
