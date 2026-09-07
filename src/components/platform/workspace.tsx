import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Factory,
  MapPinned,
  Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./workspace.module.css";

type Metric = { label: string; value: number; detail: string };

type Module = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const adminModules: Module[] = [
  {
    href: "/app/admin/organizations",
    title: "Organizations",
    description: "Onboard Kultur, advertisers, and venue partners.",
    icon: Building2,
  },
  {
    href: "/app/admin/events",
    title: "Events & venues",
    description: "Register Ganesh Puja events and physical activation sites.",
    icon: MapPinned,
  },
  {
    href: "/app/admin/campaigns",
    title: "Campaign studio",
    description: "Shape sponsor campaigns, rewards, and activation windows.",
    icon: Megaphone,
  },
  {
    href: "/app/admin/production",
    title: "Production desk",
    description: "Create batches, prepare QR artwork, and manage delivery.",
    icon: Factory,
  },
];

type AdminWorkspaceProps = { metrics: readonly Metric[]; configured: boolean };

export function AdminWorkspace({ metrics, configured }: AdminWorkspaceProps) {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Kultur command center</p>
          <h1 className={styles.title}>
            Run the full campaign, without losing the field.
          </h1>
          <p className={styles.description}>
            Plan every commercial activation from partner onboarding to reward
            redemption in one operational workspace.
          </p>
        </div>
        <aside className={styles.heroAside}>
          <p>
            Phase 1 is purpose-built for Ganesh Puja operations. Every object
            here maps to the physical-to-digital campaign lifecycle.
          </p>
        </aside>
      </section>

      <section className={styles.metrics} aria-label="Operational metrics">
        {metrics.map((metric) => (
          <article className={styles.metric} key={metric.label}>
            <p className={styles.metricLabel}>{metric.label}</p>
            <p className={styles.metricValue}>
              {metric.value.toLocaleString("en-IN")}
            </p>
            <p className={styles.metricDetail}>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Build the operation</h2>
            <p className={styles.sectionDescription}>
              Set up entities in the same order they exist in the real world.
            </p>
          </div>
        </header>
        <div className={styles.modules}>
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                href={module.href}
                className={styles.module}
                key={module.href}
              >
                <span className={styles.moduleIcon}>
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <span>
                  <span className={styles.moduleTitle}>{module.title}</span>
                  <span className={styles.moduleCopy}>
                    {module.description}
                  </span>
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
        {!configured ? (
          <div className={styles.empty}>
            <p>
              Connect Supabase to begin creating operational records. The
              interface intentionally does not use fabricated numbers or sample
              campaigns.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
