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
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <ProfileForm partTimer={partTimer} allSkills={allSkills} />
    </>
  );
}
