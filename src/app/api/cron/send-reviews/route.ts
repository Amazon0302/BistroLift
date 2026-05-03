import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/twilio";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 45 * 60 * 1000);

  const customers = await prisma.customer.findMany({
    where: {
      smsSent: false,
      phone: { not: null },
      visitedAt: { lte: cutoff },
    },
    include: { restaurant: true },
    take: 50,
  });

  const results = await Promise.allSettled(
    customers.map(async (customer) => {
      const msg = `Hi ${customer.name ?? "there"}! How was your visit at ${customer.restaurant.name}? 😊 If you had a great time, a quick Google review means the world to us: ${customer.restaurant.googleReviewLink ?? ""}`;

      await sendSMS(customer.phone!, msg);

      await prisma.customer.update({
        where: { id: customer.id },
        data: { smsSent: true, smsSentAt: new Date() },
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed });
}
