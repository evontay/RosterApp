import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AcceptInviteForm } from "./AcceptInviteForm";
import { hashColor } from "@/components/Avatar";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const membership = await prisma.rosterMembership.findUnique({
    where: { inviteToken: token },
    include: {
      business: true,
      partTimer: true,
    },
  });

  if (!membership || membership.status === "removed") notFound();

  const skills = await prisma.skill.findMany({
    where: { archived: false },
    orderBy: { label: "asc" },
  });

  const { business, partTimer } = membership;
  const ownerAvatarColor = business.avatarColor ?? hashColor(business.id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sun-page py-10">
      <div className="w-full max-w-sm px-4">
        <AcceptInviteForm
          token={token}
          name={partTimer.name}
          email={partTimer.email}
          businessName={business.name}
          ownerName={business.ownerName ?? business.name}
          ownerAvatarEmoji={business.avatarEmoji}
          ownerAvatarColor={ownerAvatarColor}
          skills={skills.map((s) => ({ id: s.id, label: s.label }))}
        />
      </div>
    </div>
  );
}
