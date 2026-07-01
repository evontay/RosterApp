import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export default async function MyProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const partTimer = await prisma.partTimer.findFirst({
    where: { userId: session.user.id },
    include: {
      skills: { include: { skill: true } },
      availability: true,
    },
  });

  if (!partTimer) redirect("/login");

  const allSkills = await prisma.skill.findMany({ orderBy: { label: "asc" } });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-gray-800">MyCrew</span>
        <a href="/my-shifts" className="text-sm text-gray-600 hover:text-gray-900">My Shifts</a>
        <a href="/my-profile" className="text-sm text-gray-600 hover:text-gray-900">Profile</a>
      </nav>
      <main className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
        <ProfileForm partTimer={partTimer} allSkills={allSkills} />
      </main>
    </div>
  );
}
