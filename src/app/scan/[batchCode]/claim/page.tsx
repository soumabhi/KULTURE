import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import KeycapButton, { KeycapLink } from "@/components/keycap-button";
import { getScanContext } from "@/lib/features/scans/get-scan-context";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requestClaimOtp, resendClaimOtp, verifyClaimOtp } from "./actions";

type ClaimPageProps = {
  params: Promise<{
    batchCode: string;
  }>;
  searchParams: Promise<{
    step?: string;
    error?: string;
  }>;
};

type PublicClaim = {
  claim_status: string;
  voucher_code: string | null;
  voucher_status: string | null;
  issued_at: string | null;
  expires_at: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ClaimPage({
  params,
  searchParams,
}: ClaimPageProps) {
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

  const step = query.step ?? "phone";
  const campaignTitle = context.config?.title ?? context.campaign.name;
  const sponsorName = context.config?.sponsorName;

  return (
    <main className="stage flex min-h-dvh items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/85 p-8 shadow-xl backdrop-blur-md">
        <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
          {sponsorName ? `Sponsored by ${sponsorName}` : "KULTUR offer"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">
          {campaignTitle}
        </h1>

        <ol className="mt-5 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
          <li className={step === "phone" ? "text-ink" : ""}>1 · Number</li>
          <li aria-hidden="true">→</li>
          <li className={step === "otp" ? "text-ink" : ""}>2 · Verify</li>
          <li aria-hidden="true">→</li>
          <li className={step === "done" ? "text-ink" : ""}>3 · Voucher</li>
        </ol>

        {query.error ? (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {query.error}
          </p>
        ) : null}

        {step === "otp" ? <OtpStep batchCode={batchCode} /> : null}
        {step === "done" ? <DoneStep batchCode={batchCode} /> : null}
        {step !== "otp" && step !== "done" ? (
          <PhoneStep batchCode={batchCode} />
        ) : null}
      </section>
    </main>
  );
}

function PhoneStep({ batchCode }: { batchCode: string }) {
  return (
    <form action={requestClaimOtp} className="mt-6 space-y-4">
      <input type="hidden" name="batchCode" value={batchCode} />
      <label htmlFor="phone" className="block text-sm font-medium text-ink">
        Mobile number
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        placeholder="98765 43210"
        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-black/35"
      />
      <p className="text-xs text-muted">
        We verify your number with a one-time code so each guest claims the
        offer once.
      </p>

      <fieldset className="space-y-3 rounded-xl border border-black/10 bg-white/60 p-4">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="consentTerms"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#7c5f3c]"
          />
          <span>
            I agree to the offer terms and the KULTUR privacy policy, and I
            understand my number is used once to verify and deliver this
            voucher.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            name="consentMarketing"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#7c5f3c]"
          />
          <span>
            Optional: share my number with the sponsor for future offers and
            updates.
          </span>
        </label>
      </fieldset>

      <div className="flex items-center justify-between gap-3 pt-2">
        <KeycapLink href={`/scan/${encodeURIComponent(batchCode)}`}>
          Back
        </KeycapLink>
        <KeycapButton type="submit">Send code</KeycapButton>
      </div>
    </form>
  );
}

function OtpStep({ batchCode }: { batchCode: string }) {
  return (
    <div className="mt-6 space-y-6">
      <form action={verifyClaimOtp} className="space-y-4">
        <input type="hidden" name="batchCode" value={batchCode} />
        <label htmlFor="code" className="block text-sm font-medium text-ink">
          6-digit verification code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          pattern="\d{6}"
          maxLength={6}
          placeholder="••••••"
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-ink outline-none transition focus:border-black/35"
        />
        <div className="flex items-center justify-between gap-3 pt-2">
          <KeycapLink href={`/scan/${encodeURIComponent(batchCode)}/claim`}>
            Change number
          </KeycapLink>
          <KeycapButton type="submit">Verify &amp; claim</KeycapButton>
        </div>
      </form>

      <form action={resendClaimOtp}>
        <input type="hidden" name="batchCode" value={batchCode} />
        <button
          type="submit"
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          Didn&apos;t receive it? Send a new code
        </button>
      </form>
    </div>
  );
}

async function DoneStep({ batchCode }: { batchCode: string }) {
  const cookieStore = await cookies();
  const claimToken = cookieStore.get("kultur_claim_token")?.value;

  if (!claimToken || !getSupabasePublicConfig()) {
    redirect(
      `/scan/${encodeURIComponent(batchCode)}/claim?error=${encodeURIComponent("Your claim session expired. Verify again.")}`,
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_claim", {
    input_claim_token: claimToken,
  });

  const claim =
    ((Array.isArray(data) ? data[0] : data) as PublicClaim | null) ?? null;

  if (error || !claim?.voucher_code) {
    redirect(
      `/scan/${encodeURIComponent(batchCode)}/claim?error=${encodeURIComponent("No verified voucher found for this session.")}`,
    );
  }

  return (
    <div className="mt-6 space-y-5 text-center">
      <p className="text-sm text-muted">
        Your reward is verified. Show this code to the partner:
      </p>
      <p className="rounded-2xl border-2 border-dashed border-[#9a6a2f]/60 bg-[#fdf6e9] px-4 py-5 font-mono text-2xl font-bold tracking-[0.12em] text-[#241f1b]">
        {claim.voucher_code}
      </p>
      <dl className="grid grid-cols-2 gap-3 text-left text-sm">
        <div className="rounded-xl border border-black/10 bg-white/70 p-3">
          <dt className="text-muted">Status</dt>
          <dd className="font-semibold text-ink">{claim.voucher_status}</dd>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/70 p-3">
          <dt className="text-muted">Issued</dt>
          <dd className="font-semibold text-ink">
            {claim.issued_at
              ? dateFormatter.format(new Date(claim.issued_at))
              : "—"}
          </dd>
        </div>
      </dl>
      {claim.expires_at ? (
        <p className="text-xs text-muted">
          Valid until {dateFormatter.format(new Date(claim.expires_at))}
        </p>
      ) : null}
      <KeycapLink href="/">Back to KULTUR</KeycapLink>
    </div>
  );
}
