import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PartTimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "part_timer") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-800">MyCrew</span>
          <Link href="/home" className="text-sm text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/my-shifts" className="text-sm text-gray-600 hover:text-gray-900">
            My Shifts
          </Link>
          <Link href="/my-settings" className="text-sm text-gray-600 hover:text-gray-900">
            Settings
          </Link>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
            Sign out
          </button>
        </form>
      </nav>
      <main className="p-6 max-w-xl mx-auto">{children}</main>
    </div>
  );
}
