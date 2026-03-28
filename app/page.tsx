import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        background: "#0e0f13",
        color: "#e8e6e1",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
        }

        .brand {
          font-family: 'Lora', serif;
          font-weight: 700;
        }

        .hero-title {
          font-family: 'Lora', serif;
          font-weight: 700;
          font-style: italic;
          line-height: 1.05;
        }

        .pulse-dot {
          animation: pulse-ring 1.8s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(99, 179, 237, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(99, 179, 237, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 179, 237, 0); }
        }

        .fade-up {
          animation: fadeUp 0.9s ease both;
        }

        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-primary {
          background: #e8e6e1;
          color: #0e0f13;
          border-radius: 100px;
          padding: 16px 36px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.02em;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s, transform 0.2s, color 0.2s;
          text-decoration: none;
        }

        .btn-primary:hover {
          background: #63b3ed;
          color: #fff;
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: transparent;
          color: #9ca3af;
          border-radius: 100px;
          padding: 16px 36px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 14px;
          letter-spacing: 0.02em;
          border: 1px solid #2a2c34;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: border-color 0.2s, color 0.2s, transform 0.2s;
          text-decoration: none;
        }

        .btn-ghost:hover {
          border-color: #4b5563;
          color: #e8e6e1;
          transform: translateY(-2px);
        }

        .card {
          background: #14161c;
          border: 1px solid #1f2229;
          border-radius: 20px;
          padding: 36px;
          transition: border-color 0.2s, transform 0.2s;
        }

        .card:hover {
          border-color: #2e3340;
          transform: translateY(-4px);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .divider {
          width: 48px;
          height: 1px;
          background: #2a2c34;
          margin: 28px 0;
        }

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #e8e6e1;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #14161c;
          border: 1px solid #1f2229;
          border-radius: 100px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 36px;
        }

        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4b5563;
          margin-bottom: 12px;
        }

        .glow-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #1f2229 20%, #2a2c34 50%, #1f2229 80%, transparent);
        }
      `}</style>

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 48px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#1f2229",
              border: "1px solid #2a2c34",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#63b3ed"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <span
            className="brand"
            style={{ fontSize: 17, color: "#e8e6e1", letterSpacing: "-0.01em" }}
          >
            Benchmark<span style={{ color: "#63b3ed" }}>Pro</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/login" className="nav-link">
            Sign in
          </Link>
          <Link
            href="/register"
            className="btn-primary"
            style={{ padding: "11px 24px", fontSize: 13 }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 32px 80px",
          maxWidth: "860px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div className="badge fade-up fade-up-1">
          <span
            className="pulse-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#63b3ed",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          2024 / 2025 Reporting Cycle · Live
        </div>

        <h1
          className="hero-title fade-up fade-up-2"
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            marginBottom: 24,
            color: "#e8e6e1",
          }}
        >
          Measure what matters.
          <br />
          <span style={{ color: "#63b3ed", fontStyle: "italic" }}>
            Audit with trust.
          </span>
        </h1>

        <p
          className="fade-up fade-up-3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 17,
            fontWeight: 300,
            color: "#6b7280",
            lineHeight: 1.75,
            maxWidth: 560,
            marginBottom: 44,
          }}
        >
          A quiet, focused platform for Fellowship Leaders to share their work —
          and for Admins to review it with clarity and confidence.
        </p>

        <div
          className="fade-up fade-up-4"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link href="/register" className="btn-primary">
            Create an account
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign into portal
          </Link>
        </div>
      </main>

      {/* Thin divider */}
      <div style={{ padding: "0 48px" }}>
        <div className="glow-line" />
      </div>

      {/* Features */}
      <section
        style={{
          padding: "80px 48px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <p
          className="section-label"
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          How it works
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {/* Card 1 */}
          <div className="card">
            <div className="card-icon" style={{ background: "#1a2420" }}>
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4ade80"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h4
              className="brand"
              style={{ fontSize: 16, color: "#e8e6e1", marginBottom: 10 }}
            >
              Evidence first
            </h4>
            <div className="divider" />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Leaders upload photos and documents directly to specific
              performance indicators — no ambiguity, no back-and-forth.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div className="card-icon" style={{ background: "#1e1a11" }}>
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fbbf24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4
              className="brand"
              style={{ fontSize: 16, color: "#e8e6e1", marginBottom: 10 }}
            >
              Cycle control
            </h4>
            <div className="divider" />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Admins open and close reporting windows with a single action,
              keeping data clean and audits honest.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div className="card-icon" style={{ background: "#111827" }}>
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#63b3ed"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </div>
            <h4
              className="brand"
              style={{ fontSize: 16, color: "#e8e6e1", marginBottom: 10 }}
            >
              Live analytics
            </h4>
            <div className="divider" />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Track parish-wide compliance and spot performance gaps across
              fellowships as submissions come in.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #1f2229",
          padding: "32px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#374151",
            fontWeight: 400,
          }}
        >
          © 2026 BenchmarkPro · Parish Performance Division
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="nav-link"
              style={{ fontSize: 12 }}
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
