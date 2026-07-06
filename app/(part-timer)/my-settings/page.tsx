import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "../my-profile/ProfileForm";
import { AvailabilityEditor } from "./AvailabilityEditor";

export default async function MySettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      availability: true,
      memberships: { orderBy: { invitedAt: "asc" }, take: 1 },
    },
  });

  if (!partTimer) redirect("/login");

  const memberSince = partTimer.memberships[0]?.invitedAt ?? null;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      <ProfileForm partTimer={partTimer} memberSince={memberSince} />

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Availability preference</h2>
        <AvailabilityEditor
          initial={partTimer.availability.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            preference: a.preference,
          }))}
        />
      </div>
    </>
  );
}
