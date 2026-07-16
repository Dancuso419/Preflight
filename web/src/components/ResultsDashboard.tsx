import { useState } from "react";
import type { GemminiReport } from "../types";

interface Props {
  report: GemminiReport;
  onMint: (walletAddress: string) => void;
  minting: boolean;
}

const CAT_LABELS: Record<string, string> = {
  innovation: "Innovation",
  technicalExecution: "Technical Execution",
  monadIntegration: "Monad Integration",
  businessPotential: "Business Potential",
};

function scoreClass(pct: number): "high" | "mid" | "low" {
  return pct >= 80 ? "high" : pct >= 60 ? "mid" : "low";
}

function scoreLabel(pct: number): string {
  return pct >= 80 ? "PREFLIGHT READY" : pct >= 60 ? "NEEDS WORK" : "NOT READY";
}

function ScoreRing({ pct }: { pct: number }) {
  const cls = scoreClass(pct);
  const r = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="score-hero">
      <div className="score-ring">
        <svg className="ring-svg" viewBox="0 0 160 160">
          <circle className="ring-track" cx="80" cy="80" r={r} />
          <circle
            className={`ring-fill ring-fill--${cls}`}
            cx="80" cy="80" r={r}
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="ring-inner">
          <span className={`score-num score-num--${cls}`}>{pct}</span>
          <span className="score-pct" style={{ display: "none" }}>%</span>
          <span className="score-label">READINESS</span>
        </div>
      </div>
      <div className={`verdict-pill verdict-pill--${cls}`}>{scoreLabel(pct)}</div>
    </div>
  );
}

export function ResultsDashboard({ report, onMint, minting }: Props) {
  const [walletAddress, setWalletAddress] = useState("");
  const cls = scoreClass(report.readinessPct);
  const canMint = report.readinessPct >= 80;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Header ── */}
      <div className="results-header">
        <div>
          <span className="section-tag">PreFlight Complete</span>
          <h2 style={{ marginBottom: 0 }}>Your Results</h2>
        </div>
        <div
          className={`confidence confidence--${report.judgeConfidence.toLowerCase()}`}
          aria-label={`Judge confidence: ${report.judgeConfidence}`}
        >
          <span className="confidence-dot" aria-hidden="true" />
          {report.judgeConfidence} Confidence
        </div>
      </div>

      {/* ── Score + Categories ── */}
      <div className="grid-2">
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ScoreRing pct={report.readinessPct} />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>Category Scores</h3>
          <div className="cat-list">
            {Object.entries(report.categoryScores).map(([key, val], i) => (
              <div key={key} className="cat-row">
                <span className="cat-name">{CAT_LABELS[key] ?? key}</span>
                <div className="cat-track" role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="cat-fill"
                    style={{ width: `${val}%`, "--delay": `${i * 0.1}s` } as React.CSSProperties}
                  />
                </div>
                <span className="cat-score">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Narrative ── */}
      <div className="card">
        <span className="section-tag" style={{ background: "var(--blue)" }}>AI Judge Analysis</span>
        <p className="narrative">{report.narrativeFeedback}</p>
      </div>

      {/* ── Judge Questions + Improvements ── */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Judge May Ask...</h3>
          <ul className="insight-list">
            {report.likelyJudgeQuestions.map((q, i) => (
              <li key={i} className="insight-item">
                <span className="insight-marker" aria-hidden="true">?</span>
                {q}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Improvements</h3>
          <ul className="insight-list">
            {report.improvementSuggestions.map((s, i) => (
              <li key={i} className="insight-item">
                <span className="insight-marker" aria-hidden="true">{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Mint section ── */}
      <div className="card">
        {canMint ? (
          <div className="mint-section" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
            <p className="mint-headline">🏅 You're eligible for a PreFlight Ready badge</p>
            <p className="mint-sub">
              Score {report.readinessPct}% — above the 80% threshold. Mint a soulbound NFT on Monad as proof.
            </p>
            <div className="input-group">
              <label className="input-label">Your Monad Wallet Address</label>
              <input
                className="input"
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <span className="input-hint">This address will receive the soulbound NFT. Wallet connect in next update.</span>
            </div>
            <button
              className="btn btn--green btn--lg"
              onClick={() => onMint(walletAddress)}
              disabled={minting || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)}
            >
              {minting ? "Minting on Monad..." : "✦ Mint PreFlight Badge"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="mint-headline">
              <span style={{ color: cls === "low" ? "var(--red)" : "var(--amber)" }}>
                {report.readinessPct}% — {80 - report.readinessPct} points short of badge eligibility
              </span>
            </p>
            <p className="narrative">Apply the improvements above, then re-submit. The badge threshold is 80%.</p>
          </div>
        )}
      </div>
    </div>
  );
}
