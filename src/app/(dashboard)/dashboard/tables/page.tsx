import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TablesManager from "@/components/dashboard/TablesManager";

export default async function TablesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: { tables: { orderBy: { number: "asc" } } },
  });

  if (!restaurant) redirect("/login");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-[26px] font-extrabold text-gray-900">QR Codes</h2>
        <p className="text-gray-400 text-[14px] mt-1">Generate and download QR codes for each table</p>
      </div>
      <TablesManager
        restaurantId={restaurant.id}
        restaurantSlug={restaurant.slug}
        initialTables={restaurant.tables}
      />
    </div>
  );
}
