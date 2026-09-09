import Image from "next/image";
import CoverFlow from "@/components/cover-flow";
import FloatingMenu from "@/components/floating-menu";
import HeroTitle from "@/components/hero-title";
import LogoLockup from "@/components/logo-lockup";
import NavHeader from "@/components/nav-header";
import { NavProvider } from "@/components/nav-provider";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import StackedSections from "@/components/stacked-sections";
import WhyKultureSection from "@/components/why-kulture-section";
import WhatWeDoSection from "@/components/what-we-do-section";
import WhereWeDoSection from "@/components/where-we-do-section";
import WhoWeServeSection from "@/components/who-we-serve-section";
import WhoWeAreSection from "@/components/who-we-are-section";

const BOTTLE_PRELOADS = [
  "/kb-3.png",
  "/kb-1.png",
  "/kb-4.png",
  "/kb-5.png",
  "/kb-2.png",
] as const;

export default function Home() {
  return (
    <NavProvider>
      <SmoothScrollProvider>
        <div className="home-wrapper relative w-full overflow-x-hidden">
          {BOTTLE_PRELOADS.map((href) => (
            <link key={href} rel="preload" as="image" href={href} />
          ))}

          <FloatingMenu />

        <StackedSections
          heroChildren={
            <div className="stage relative min-h-dvh w-full overflow-hidden">
              <Image
                src="/konarkt.png"
                alt=""
                width={1365}
                height={1152}
                priority
                decoding="async"
                draggable={false}
                sizes="(max-width: 768px) 0vw, (max-width: 1200px) 46vw, 550px"
                className="enter-side pointer-events-none absolute bottom-[7vh] left-0 z-0 hidden h-[74dvh] w-auto max-w-[46vw] object-contain object-bottom-left select-none md:block"
              />

              <Image
                src="/kdance.png"
                alt=""
                width={1377}
                height={1142}
                priority
                decoding="async"
                draggable={false}
                sizes="(max-width: 768px) 0vw, (max-width: 1200px) 46vw, 550px"
                className="enter-side pointer-events-none absolute right-0 bottom-[3vh] z-0 hidden h-[74dvh] w-auto max-w-[46vw] object-contain object-bottom-right select-none md:block"
              />

              <Image
                src="/kwat.png"
                alt=""
                width={2172}
                height={724}
                priority
                decoding="async"
                draggable={false}
                sizes="100vw"
                className="enter-water pointer-events-none absolute bottom-0 left-0 z-1 hidden h-auto w-full select-none md:block"
              />

              <HeroTitle />
              <CoverFlow />
              <LogoLockup />
              <NavHeader />
            </div>
          }
          whyKultureChildren={<WhyKultureSection />}
          whatWeDoChildren={<WhatWeDoSection />}
          whereWeDoChildren={<WhereWeDoSection />}
          whoWeServeChildren={<WhoWeServeSection />}
          whoWeAreChildren={<WhoWeAreSection />}
        />
        </div>
      </SmoothScrollProvider>
    </NavProvider>
  );
}

