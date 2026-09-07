import Link from "next/link";
import KeycapButton from "@/components/keycap-button";
import styles from "./app-shell.module.css";

type AppShellProps = {
  children: React.ReactNode;
  email: string | null;
};

export default function AppShell({ children, email }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/app" className={styles.brand}>
            <span className={styles.brandMark}>KULTUR</span>
            <span className={styles.brandSub}>SaaS</span>
          </Link>

          <nav className={styles.nav} aria-label="Platform sections">
            <Link href="/app/admin" className={styles.navLink}>
              Admin
            </Link>
            <Link href="/app/advertiser" className={styles.navLink}>
              Advertiser
            </Link>
            <Link href="/app/venue" className={styles.navLink}>
              Venue
            </Link>
            <Link href="/app/volunteer" className={styles.navLink}>
              Volunteer
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">
              {email ?? "Signed in"}
            </span>
            <form action="/logout" method="get">
              <KeycapButton type="submit">Sign Out</KeycapButton>
            </form>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
