import KeycapButton from "@/components/keycap-button";

type UnconfiguredCardProps = {
  reason: string;
};

export function UnconfiguredCard({ reason }: UnconfiguredCardProps) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-8">
      <h1 className="text-2xl font-semibold text-amber-900">
        Platform Setup Required
      </h1>
      <p className="mt-3 text-sm text-amber-800">{reason}</p>
      <p className="mt-2 text-sm text-amber-800">
        Configure Supabase environment variables, then sign in to access SaaS
        routes.
      </p>
      <div className="mt-6">
        <form action="/login" method="get">
          <KeycapButton type="submit">Go to Login</KeycapButton>
        </form>
      </div>
    </section>
  );
}

type UnauthorizedCardProps = {
  title?: string;
  description?: string;
};

export function UnauthorizedCard({
  title = "Access Restricted",
  description = "Your current organization role does not permit this workspace.",
}: UnauthorizedCardProps) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-red-300 bg-red-50 p-8">
      <h1 className="text-2xl font-semibold text-red-900">{title}</h1>
      <p className="mt-3 text-sm text-red-800">{description}</p>
      <div className="mt-6">
        <form action="/app" method="get">
          <KeycapButton type="submit">Back to Platform Home</KeycapButton>
        </form>
      </div>
    </section>
  );
}
