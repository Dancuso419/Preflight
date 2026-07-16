import { useEffect, useRef, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "./lib/wagmi";
import { InputForm } from "./components/InputForm";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { BadgeViewer } from "./components/BadgeViewer";
import type { ReviewInputs, GemminiReport } from "./types";

const queryClient = new QueryClient();

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type View = "landing" | "loading" | "results" | "badge";

// ─── Scroll reveal hook ──────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Animated terminal ────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: "$ preflight run github.com/builder/defi-swap", cls: "" },
  { text: "  ✓ Repo scanned     (12 commits, eligible)", cls: "t-pass" },
  { text: "  ✓ Live app         (score: 80/100)", cls: "t-pass" },
  { text: "  ✓ Contract         (deployed on Monad ✓)", cls: "t-pass" },
  { text: "  ✓ x402 flow        (5/5 steps passed)", cls: "t-pass" },
  { text: "  ⟳ AI analysis      running...", cls: "t-dim" },
  { text: "", cls: "" },
  { text: "  READINESS SCORE: 91%", cls: "t-score" },
  { text: "  ✦ PREFLIGHT READY — eligible for badge mint", cls: "t-pass" },
];

function Terminal() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= TERMINAL_LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 600 : 420);
    return () => clearTimeout(t);
  }, [shown]);
  return (
    <div className="hero-terminal">
      <div className="terminal-titlebar">
        <span className="terminal-dot" /><span className="terminal-dot" /><span className="terminal-dot" />
        <span className="terminal-title">preflight — bash</span>
      </div>
      <div className="terminal-body">
        {TERMINAL_LINES.slice(0, shown).map((l, i) => (
          <span
            key={i}
            className={`t-line ${l.cls}`}
            style={{ animationDelay: "0ms" }}
          >
            {l.text || " "}
          </span>
        ))}
        {shown < TERMINAL_LINES.length && (
          <span className="t-line t-dim" style={{ animationDelay: "0ms" }}>▋</span>
        )}
      </div>
    </div>
  );
}

// ─── Loading screen ────────────────────────────────────────────────────
const STEPS = [
  "Scanning GitHub repository",
  "Checking live app status",
  "Verifying contract on Monad",
  "Testing x402 payment flow",
  "Running AI analysis...",
];

function LoadingScreen() {
  return (
    <div className="loading-page">
      <p className="loading-title">Running PreFlight...</p>
      <div className="loading-steps">
        {STEPS.map((s, i) => (
          <div key={s} className="loading-step" style={{ "--delay": `${i * 0.16}s` } as React.CSSProperties}>
            <span className="loading-dot" style={{ "--delay": `${i * 0.2}s` } as React.CSSProperties} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────
function Nav({ view, onBack }: { view: View; onBack: () => void }) {
  return (
    <div className="nav-wrap">
      <nav className="nav">
        <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
          ✈ PreFlight
          <span className="nav-badge">BETA</span>
        </a>
        <div className="nav-right">
          {view === "landing" && (
            <a href="#run" className="btn btn--accent" style={{ padding: "9px 20px", fontSize: "0.88rem", boxShadow: "var(--sh-xs)" }}>
              Run PreFlight →
            </a>
          )}
          {(view === "results" || view === "badge") && (
            <button className="btn btn--ghost" onClick={onBack} style={{ fontSize: "0.82rem", padding: "9px 16px", boxShadow: "none" }}>
              ← Back
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

// ─── Landing page ──────────────────────────────────────────────────────
const VALIDATORS = [
  { icon: "🐙", name: "GitHub Repo",        desc: "Commit history, eligibility window, README, bulk-import detection" },
  { icon: "🌐", name: "Live App",           desc: "Reachability + boilerplate/placeholder pattern scan" },
  { icon: "⛓", name: "Smart Contract",     desc: "Bytecode verification on Monad via eth_getCode" },
  { icon: "💳", name: "x402 Payment Flow", desc: "5-step end-to-end payment protocol validation" },
  { icon: "🤖", name: "AI Judge (Gemmini)", desc: "Category scoring, judge questions, improvement suggestions" },
];

function LandingPage({ onSubmit, loading }: { onSubmit: (inputs: ReviewInputs) => void; loading: boolean }) {
  const howRef = useReveal();
  const checkRef = useReveal();
  const demoRef = useReveal();
  const formRef = useReveal();

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">
                Know your score<br />before the judges do.
              </h1>
              <p className="hero-sub">
                5 automated validators + an AI judge persona review your project in ~30 seconds. Get exact fixes while you still have time to apply them.
              </p>
              <div className="hero-ctas">
                <a href="#run" className="btn btn--accent btn--xl">
                  Run PreFlight Free →
                </a>
                <button className="btn btn--ghost btn--lg" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
                  How it works
                </button>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-num">5</span>
                  <span className="hero-stat-label">Validators</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">~30s</span>
                  <span className="hero-stat-label">Results</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">80%</span>
                  <span className="hero-stat-label">Badge Threshold</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">Free</span>
                  <span className="hero-stat-label">Always</span>
                </div>
              </div>
            </div>
            <Terminal />
          </div>
        </div>
      </section>

      {/* STRIP — infinite marquee */}
      <div className="strip" aria-hidden="true">
        <div className="strip-track">
          {[
            "✈ GitHub repo scan", "🌐 Live app check", "⛓ Contract verify",
            "💳 x402 flow test", "🤖 AI analysis", "🏅 Monad badge mint",
            "✈ GitHub repo scan", "🌐 Live app check", "⛓ Contract verify",
            "💳 x402 flow test", "🤖 AI analysis", "🏅 Monad badge mint",
          ].map((item, i) => (
            <div key={i} className="strip-item">{item}</div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="container">
          <div className={`section-heading reveal ${howRef.visible ? "visible" : ""}`} ref={howRef.ref}>
            <h2>How it works</h2>
            <p>Three steps from "I hope it's good" to "I know exactly what to fix."</p>
          </div>
          <div className="steps-grid">
            {[
              { n: "01", title: "Submit your links", desc: "Paste your GitHub repo, live app, contract address, and optional x402 endpoint. Takes 30 seconds." },
              { n: "02", title: "We validate everything", desc: "5 validators run in parallel — repo health, app status, contract, x402 flow, and AI judge analysis." },
              { n: "03", title: "Get your verdict", desc: "Readiness score + category breakdown + exact improvement suggestions. Hit 80%? Mint your badge." },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <span className="step-num">{s.n}</span>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE CHECK */}
      <section className="section--tight" style={{ background: "var(--ink)", borderBlock: "var(--border)" }} id="check">
        <div className="container">
          <div className={`section-heading reveal ${checkRef.visible ? "visible" : ""}`} ref={checkRef.ref} style={{ color: "#fff" }}>
            <h2 style={{ color: "#fff" }}>What we check</h2>
            <p style={{ color: "#aaa" }}>Every validator runs in parallel. Results in seconds, not minutes.</p>
          </div>
          <div className="validators-grid">
            {VALIDATORS.map((v) => (
              <div key={v.name} className="validator-card" style={{ background: "#161616", borderColor: "#333" }}>
                <span className="validator-icon">{v.icon}</span>
                <div className="validator-name" style={{ color: "#fff" }}>{v.name}</div>
                <div className="validator-desc" style={{ color: "#aaa" }}>{v.desc}</div>
                <div className="validator-status">● Active</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCORE DEMO */}
      <section className="section">
        <div className="container">
          <div className={`section-heading reveal ${demoRef.visible ? "visible" : ""}`} ref={demoRef.ref}>
            <h2>Real results from real fixes</h2>
            <p>A builder applied 3 improvement suggestions. Their score jumped 49 points in under an hour.</p>
          </div>
          <div className="score-demo">
            <div className="score-demo-card score-demo-card--low" style={{ boxShadow: "var(--sh-md)" }}>
              <div className="demo-score demo-score--low">42%</div>
              <div className="demo-label">Before PreFlight</div>
              <div className="demo-verdict demo-verdict--low">✗ NOT READY</div>
              <div style={{ marginTop: "16px", fontSize: "0.82rem", color: "var(--ink-2)" }}>
                Missing README · Broken x402 · Placeholder text on live app
              </div>
            </div>
            <div className="score-arrow">→</div>
            <div className="score-demo-card score-demo-card--high" style={{ boxShadow: "var(--sh-md)", borderColor: "var(--green)" }}>
              <div className="demo-score demo-score--high">91%</div>
              <div className="demo-label">After applying fixes</div>
              <div className="demo-verdict demo-verdict--high">✦ PREFLIGHT READY</div>
              <div style={{ marginTop: "16px", fontSize: "0.82rem", color: "var(--ink-2)" }}>
                Full docs · x402 passing · Live demo polished
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM ANCHOR */}
      <section className="form-section-wrap" id="run">
        <div className="container">
          <div className={`section-heading reveal ${formRef.visible ? "visible" : ""}`} ref={formRef.ref}>
            <h2>Ready to know your score?</h2>
            <p>Fill in your project details below. Results in ~30 seconds.</p>
          </div>
          <InputForm onSubmit={onSubmit} loading={loading} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <span>PreFlight — AI pre-submission review for Monad builders</span>
        <span>Powered by Gemmini + Monad · <a href="https://testnet.monadexplorer.com/address/0x659A05Bab409E6Ccb76a715c9167d8A0344A4897" target="_blank" rel="noreferrer">Contract ↗</a></span>
      </footer>
    </>
  );
}

// ─── App ───────────────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState<View>("landing");
  const [report, setReport] = useState<GemminiReport | null>(null);
  const [badge, setBadge] = useState<{ txHash: string; tokenId: string; explorerLink: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);

  async function runReview(inputs: ReviewInputs) {
    setView("loading");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch(`${API}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      setReport(await res.json() as GemminiReport);
      setView("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed");
      setView("landing");
    }
  }

  async function mintBadge(walletAddress: string) {
    if (!report) return;
    setMinting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, report }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Mint failed (${res.status})`);
      }
      setBadge(await res.json() as { txHash: string; tokenId: string; explorerLink: string });
      setView("badge");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mint failed");
    } finally {
      setMinting(false);
    }
  }

  function goHome() {
    setView("landing");
    setReport(null);
    setBadge(null);
    setError(null);
    window.scrollTo({ top: 0 });
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={darkTheme({ accentColor: "#B45FFF", accentColorForeground: "#0A0A0A" })}>
      <Nav view={view} onBack={goHome} />
      <main style={{ flex: 1 }}>
        {error && (
          <div className="container" style={{ paddingTop: "20px" }}>
            <div className="error-banner">⚠ {error}</div>
          </div>
        )}

        {view === "landing" && <LandingPage onSubmit={runReview} loading={false} />}
        {view === "loading" && <LoadingScreen />}

        {view === "results" && report && (
          <div className="container" style={{ paddingBlock: "40px" }}>
            <ResultsDashboard report={report} onMint={mintBadge} minting={minting} />
          </div>
        )}

        {view === "badge" && badge && report && (
          <BadgeViewer
            txHash={badge.txHash}
            tokenId={badge.tokenId}
            explorerLink={badge.explorerLink}
            score={report.readinessPct}
            onReset={goHome}
          />
        )}
      </main>
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
