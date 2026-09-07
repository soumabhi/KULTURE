import Image from "next/image";
import CoverFlow from "@/components/cover-flow";
import HeroTitle from "@/components/hero-title";
import LogoLockup from "@/components/logo-lockup";
import NavHeader from "@/components/nav-header";

const BOTTLE_PRELOADS = [
  "/kb-3.png",
  "/kb-1.png",
  "/kb-4.png",
  "/kb-5.png",
  "/kb-2.png",
] as const;

export default function Home() {
  return (
    <main className="stage relative min-h-dvh overflow-hidden">
      {BOTTLE_PRELOADS.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
      <Image
        src="/konarkt.png"
        alt=""
        width={1365}
        height={1152}
        priority
        draggable={false}
        className="enter-side pointer-events-none absolute bottom-[7vh] left-0 z-0 hidden h-[74dvh] w-auto max-w-[46vw] object-contain object-bottom-left select-none md:block"
      />

      <Image
        src="/kdance.png"
        alt=""
        width={1377}
        height={1142}
        priority
        draggable={false}
        className="enter-side pointer-events-none absolute right-0 bottom-[3vh] z-0 hidden h-[74dvh] w-auto max-w-[46vw] object-contain object-bottom-right select-none md:block"
      />

      <Image
        src="/kwat.png"
        alt=""
        width={2172}
        height={724}
        priority
        draggable={false}
        className="enter-water pointer-events-none absolute bottom-0 left-0 z-1 hidden h-auto w-full select-none md:block"
      />

      <HeroTitle />

      <CoverFlow />

      <LogoLockup />

      <NavHeader />
    </main>
  );
}
