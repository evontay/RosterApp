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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-1">You're invited!</h1>
        <p className="text-sm text-gray-500 mb-6">
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
