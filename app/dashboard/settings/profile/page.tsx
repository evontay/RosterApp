import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OwnerProfileForm } from "./OwnerProfileForm";

export default async function OwnerProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "owner") redirect("/login");

  const business = await prisma.business.findFirst({
    where: { ownerUserId: session.user.id },
    select: {
      id: true,
      name: true,
      ownerName: true,
      ownerPhone: true,
      avatarEmoji: true,
      avatarColor: true,
      businessAddress: true,
    },
  });

  if (!business) redirect("/login");

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-sun-ink mb-1">My profile</h1>
      <p className="text-sm text-sun-mute mb-6">Manage your business and contact details.</p>
      <OwnerProfileForm business={business} email={session.user.email ?? ""} />
    </div>
  );
}
