import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MarkReadOnMount } from "./MarkReadOnMount";

const TYPE_CONFIG: Record<string, { label: string; dot: string }> = {
  INTEREST_CONFIRMED: { label: "Your interest was confirmed — you're assigned!", dot: "bg-status-confirmed-dot" },
  INTEREST_REJECTED:  { label: "Your interest was not taken up this time.", dot: "bg-sun-mute" },
  ASSIGNED:           { label: "You've been assigned to a shift.", dot: "bg-status-logged-dot" },
  SHIFT_CANCELLED:    { label: "This shift has been cancelled.", dot: "bg-sun-mute" },
  PAID:               { label: "You've been marked as paid.", dot: "bg-status-paid-dot" },
};

export default async function EmployeeActivityPage() {
  const session = await auth();

  const activities = await prisma.activity.findMany({
    where: { recipientId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Group by date
  const grouped = new Map<string, typeof activities>();
  for (const a of activities) {
    const key = new Date(a.createdAt).toLocaleDateString("en-SG", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(a);
  }

  return (
    <div>
      <MarkReadOnMount />
      <h1 className="text-2xl font-bold text-sun-ink mb-6">Activity</h1>

      {activities.length === 0 ? (
        <p className="text-sm text-sun-mute">🌱 No activity yet.</p>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([date, items]) => (
            <section key={date}>
              <h2 className="text-xs font-semibold text-sun-mute uppercase tracking-wide mb-3">{date}</h2>
              <div className="bg-sun-card rounded-[16px] border border-sun-border divide-y divide-sun-border">
                {items.map((a) => {
                  const meta = (a.metadata ?? {}) as Record<string, string | number | null>;
                  const config = TYPE_CONFIG[a.type] ?? { label: a.type, dot: "bg-sun-mute" };
                  const shiftDate = meta.shiftDate
                    ? new Date(meta.shiftDate as string).toLocaleDateString("en-SG", { day: "numeric", month: "short" })
                    : null;

                  const href =
                    a.entityType === "shift"
                      ? `/shifts/${a.entityId}`
                      : `/my-shifts`;

                  return (
                    <Link
                      key={a.id}
                      href={href}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-sun-inset transition-colors"
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-sun-ink">{config.label}</p>
                        <p className="text-xs text-sun-mute mt-0.5">
                          {meta.shiftTitle as string}
                          {shiftDate ? ` · ${shiftDate}` : ""}
                          {meta.payAmount != null ? ` · $${Number(meta.payAmount).toFixed(2)}` : ""}
                        </p>
                      </div>
                      <span className="ml-auto text-xs text-sun-mute shrink-0 mt-0.5">
                        {new Date(a.createdAt).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
