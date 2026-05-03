import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CustomersTable from "@/components/dashboard/CustomersTable";

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { restaurantId: restaurant.id },
    include: { table: true },
    orderBy: { visitedAt: "desc" },
    take: 200,
  });

  const serialized = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    tableNumber: c.table?.number ?? null,
    visitedAt: c.visitedAt.toISOString(),
    smsSent: c.smsSent,
    reviewClicked: c.reviewClicked,
  }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Customers</h2>
        <p className="text-zinc-400 mt-1">Contact data collected from menu scans</p>
      </div>
      <CustomersTable customers={serialized} />
    </div>
  );
}
