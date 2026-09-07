import AppShell from "@/components/platform/app-shell";
import { UnconfiguredCard } from "@/components/platform/guard-cards";
import { requireSession } from "@/lib/auth/route-guards";

type PlatformLayoutProps = {
  children: React.ReactNode;
};

export default async function PlatformLayout({
  children,
}: PlatformLayoutProps) {
  const session = await requireSession("/app");

  if (session.state === "unconfigured") {
    return (
      <main className="stage flex min-h-dvh items-center justify-center px-6 py-16">
        <UnconfiguredCard reason={session.reason} />
      </main>
    );
  }

  return <AppShell email={session.user.email}>{children}</AppShell>;
}
