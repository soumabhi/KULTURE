import { notFound } from "next/navigation";
import GaneshExperience from "@/components/experience/ganesh-experience";
import { getScanContext } from "@/lib/features/scans/get-scan-context";
import { startScanSession } from "@/lib/features/scans/session";

type ScanPageProps = {
  params: Promise<{
    batchCode: string;
  }>;
};

export default async function ScanPage({ params }: ScanPageProps) {
  const { batchCode } = await params;
  const context = await getScanContext(batchCode);

  if (context.state === "not-found") {
    notFound();
  }

  if (context.state === "unconfigured") {
    return (
      <main className="stage flex min-h-dvh items-center justify-center px-6 py-16">
        <section className="w-full max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-8 shadow-lg">
          <h1 className="text-2xl font-semibold text-amber-900">
            Scan Endpoint Not Ready
          </h1>
          <p className="mt-3 text-sm text-amber-800">{context.reason}</p>
        </section>
      </main>
    );
  }

  const scanSessionId = await startScanSession(batchCode);

  return (
    <GaneshExperience
      batchCode={batchCode}
      scanSessionId={scanSessionId}
      title={context.config?.title ?? context.campaign.name}
      subtitle={context.config?.subtitle ?? null}
      sponsorName={context.config?.sponsorName ?? null}
      gameType={context.config?.gameType ?? null}
    />
  );
}
