import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AcceptInviteForm } from "./AcceptInviteForm";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const membership = await prisma.rosterMembership.findUnique({
    where: { inviteToken: token },
    include: { business: true, partTimer: true },
  });

  if (!membership || membership.status === "removed") notFound();

  return (
    <div className="min-h-screen flex items-center justify-center bg-sun-page">
      <div className="bg-sun-card p-8 rounded-[16px] border border-sun-border shadow-sm w-full max-w-sm">
        <h1 className="text-xl font-bold text-sun-ink mb-1">You're invited!</h1>
        <p className="text-sm text-sun-mute mb-6">
          <strong>{membership.business.name}</strong> has added you to their roster.
          Set a password to activate your account.
        </p>
        <AcceptInviteForm
          token={token}
          name={membership.partTimer.name}
          email={membership.partTimer.email}
        />
      </div>
    </div>
  );
}
