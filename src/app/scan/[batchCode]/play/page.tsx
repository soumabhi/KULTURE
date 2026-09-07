import { notFound, redirect } from "next/navigation";
import CatchModak from "@/components/experience/catch-modak";
import { getScanContext } from "@/lib/features/scans/get-scan-context";

const REWARD_THRESHOLD = 8;

type PlayPageProps = {
  params: Promise<{
    batchCode: string;
  }>;
  searchParams: Promise<{
    s?: string;
  }>;
};

export default async function PlayPage({
  params,
  searchParams,
}: PlayPageProps) {
  const [{ batchCode }, query] = await Promise.all([params, searchParams]);
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

  const scanSessionId = query.s;
  const isUuid =
    typeof scanSessionId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      scanSessionId,
    );

  if (!scanSessionId || !isUuid) {
    redirect(`/scan/${encodeURIComponent(batchCode)}`);
  }

  return (
    <CatchModak
      batchCode={batchCode}
      scanSessionId={scanSessionId}
      rewardThreshold={REWARD_THRESHOLD}
    />
  );
}
