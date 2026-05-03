import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) redirect("/login");

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Restaurant Settings</h2>
        <p className="text-zinc-400 mt-1">Manage your restaurant profile and branding</p>
      </div>
      <SettingsForm
        restaurant={{
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          googleReviewLink: restaurant.googleReviewLink,
          themeColor: restaurant.themeColor,
          discountText: restaurant.discountText,
          logoUrl: restaurant.logoUrl,
          coverUrl: restaurant.coverUrl,
        }}
      />
    </div>
  );
}
