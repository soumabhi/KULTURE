export default function ScanLoading() {
  return (
    <main className="stage flex min-h-dvh items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white/80 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-ink">
          Loading Campaign Experience
        </h1>
        <p className="mt-3 text-sm text-muted">
          Preparing scan session and campaign context.
        </p>
      </section>
    </main>
  );
}
