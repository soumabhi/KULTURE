import Link from "next/link";

export default function BootstrapComplete({
  searchParams,
}: {
  searchParams?: { status?: string; message?: string };
}) {
  const status = (searchParams?.status || "").toLowerCase();
  const message = searchParams?.message || "";

  const isSuccess = status === "ok";
  const isExists = status === "exists";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          background: "white",
          borderRadius: 12,
          padding: "28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>
          Bootstrap result
        </h1>
        <p style={{ marginTop: 8, color: "#6b7280" }}>
          Confirmation of the first-admin bootstrap action.
        </p>

        <section
          style={{
            marginTop: 18,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "0 0 auto",
              width: 64,
              height: 64,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: isSuccess
                ? "#ecfdf5"
                : isExists
                  ? "#fef9c3"
                  : "#fef2f2",
            }}
          >
            <span style={{ fontSize: 28 }}>
              {isSuccess ? "✔" : isExists ? "⚠" : "✖"}
            </span>
          </div>
          <div style={{ flex: "1 1 240px" }}>
            <h2 style={{ margin: 0, fontSize: "1.125rem" }}>
              {isSuccess
                ? "You are now a Master Admin"
                : isExists
                  ? "Owner already exists"
                  : "Bootstrap result"}
            </h2>
            <p style={{ marginTop: 6, color: "#374151" }}>
              {message
                ? decodeURIComponent(message)
                : isSuccess
                  ? "You have been granted the KULTUR_OWNER role."
                  : "No action performed."}
            </p>
          </div>
        </section>

        <div
          style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <Link href="/app/admin" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: "#111827",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
              }}
            >
              Go to Admin
            </button>
          </Link>
          <Link href="/app" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: "transparent",
                color: "#111827",
                border: "1px solid #e5e7eb",
                padding: "10px 14px",
                borderRadius: 8,
              }}
            >
              Platform home
            </button>
          </Link>
          <Link
            href="/login"
            style={{ marginLeft: "auto", textDecoration: "none" }}
          >
            <button
              style={{
                background: "transparent",
                color: "#6b7280",
                border: "none",
                padding: "10px 14px",
              }}
            >
              Sign in as different user
            </button>
          </Link>
        </div>

        <p style={{ marginTop: 18, color: "#6b7280", fontSize: "0.9rem" }}>
          If you did not expect this, contact your platform administrator.
        </p>
      </div>
    </main>
  );
}
