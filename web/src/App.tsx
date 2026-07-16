import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./lib/wagmi";
import { InputForm } from "./components/InputForm";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { BadgeViewer } from "./components/BadgeViewer";
import type { ReviewInputs, GemminiReport } from "./types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type View = "form" | "loading" | "results" | "badge";

const LOADING_STEPS = [
  "Scanning GitHub repository",
  "Checking live app status",
  "Verifying contract on Monad",
  "Testing x402 payment flow",
  "Running AI analysis...",
];

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <p className="loading-title">Running PreFlight...</p>
      <div className="loading-steps">
        {LOADING_STEPS.map((step, i) => (
          <div
            key={step}
            className="loading-step"
            style={{ "--delay": `${i * 0.18}s` } as React.CSSProperties}
          >
            <span className="loading-dot" style={{ "--delay": `${i * 0.2}s` } as React.CSSProperties} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function Header({ onReset, showReset }: { onReset: () => void; showReset: boolean }) {
  return (
    <header className="site-header">
      <a className="site-logo" onClick={onReset} href="#" style={{ cursor: "pointer" }}>
        ✈ PreFlight
        <span className="logo-badge">BETA</span>
      </a>
      {showReset && (
        <button className="btn btn--ghost" onClick={onReset} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          ← Start Over
        </button>
      )}
    </header>
  );
}

function App() {
  const [view, setView] = useState<View>("form");
  const [report, setReport] = useState<GemminiReport | null>(null);
  const [badge, setBadge] = useState<{ txHash: string; tokenId: string; explorerLink: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);

  async function runReview(inputs: ReviewInputs) {
    setView("loading");
    setError(null);
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
      setView("form");
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

  function reset() {
    setView("form");
    setReport(null);
    setBadge(null);
    setError(null);
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <Header onReset={reset} showReset={view !== "form"} />
      <main style={{ flex: 1 }}>
        {view === "loading" && <LoadingScreen />}

        {view === "form" && (
          <div className="container">
            <div className="hero">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                Powered by Monad + Gemmini AI
              </div>
              <h1>Meet your AI co-judge<br />before the real one does.</h1>
              <p style={{ marginBottom: "40px" }}>
                Run 5 automated checks on your hackathon project and get an AI readiness score — with exact fixes — before the judges do.
              </p>
            </div>
            {error && <div className="error-banner" style={{ marginBottom: "20px" }}>⚠ {error}</div>}
            <InputForm onSubmit={runReview} loading={false} />
          </div>
        )}

        {view === "results" && report && (
          <div className="container">
            {error && <div className="error-banner" style={{ marginBottom: "20px" }}>⚠ {error}</div>}
            <ResultsDashboard report={report} onMint={mintBadge} minting={minting} />
          </div>
        )}

        {view === "badge" && badge && report && (
          <BadgeViewer
            txHash={badge.txHash}
            tokenId={badge.tokenId}
            explorerLink={badge.explorerLink}
            score={report.readinessPct}
            onReset={reset}
          />
        )}
      </main>
    </WagmiProvider>
  );
}

export default App;
