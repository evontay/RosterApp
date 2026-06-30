import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewShiftForm } from "./NewShiftForm";

export default async function NewShiftPage() {
  const session = await auth();
  const business = await prisma.business.findFirst({
    where: { ownerUserId: session!.user.id },
  });

  if (!business) return <p className="text-gray-500">No business found.</p>;

  const skills = await prisma.skill.findMany({ orderBy: { label: "asc" } });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Shift</h1>
      <NewShiftForm businessId={business.id} skills={skills} />
    </div>
  );
}
