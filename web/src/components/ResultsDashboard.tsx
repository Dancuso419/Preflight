import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import type { GemminiReport } from "../types";
import { ShareCard } from "./ShareCard";

interface Props {
  report: GemminiReport;
  projectTitle: string;
  onMint: (walletAddress: string) => void;
  minting: boolean;
  onRunAgain: () => void;
}

const CAT_LABELS: Record<string, string> = {
  innovation: "Innovation",
  technicalExecution: "Technical",
  monadIntegration: "Monad",
  businessPotential: "Business",
};

function scoreClass(pct: number): "high" | "mid" | "low" {
  return pct >= 80 ? "high" : pct >= 60 ? "mid" : "low";
}

function scoreLabel(pct: number): string {
  return pct >= 80 ? "PREFLIGHT READY" : pct >= 60 ? "NEEDS WORK" : "NOT READY";
}

export function ResultsDashboard({ report, projectTitle, onMint, minting, onRunAgain }: Props) {
  const { address, isConnected } = useAccount();
  const [manualAddress, setManualAddress] = useState("");
  const walletAddress = address ?? manualAddress;
  const cls = scoreClass(report.readinessPct);
  const canMint = report.readinessPct >= 80;
  const confCls = report.judgeConfidence.toLowerCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Score + Categories ── */}
      <div className="score-big-card">
        <div className="score-left">
          <div className={`score-number score-number--${cls}`}>{report.readinessPct}</div>
          <div className="score-label">Readiness %</div>
          <div className={`verdict-badge verdict-badge--${cls}`}>{scoreLabel(report.readinessPct)}</div>
          <div className="confidence-row">
            <span className={`conf-dot conf-dot--${confCls}`} />
            {report.judgeConfidence} Confidence
          </div>
        </div>

        <div className="score-right">
          <h3>Category Scores</h3>
          <div className="cat-list">
            {Object.entries(report.categoryScores).map(([key, val], i) => (
              <div key={key} className="cat-row">
                <span className="cat-name">{CAT_LABELS[key] ?? key}</span>
                <div className="cat-track" role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100}>
                  <div className="cat-fill" style={{ width: `${val}%`, "--delay": `${i * 0.1}s` } as React.CSSProperties} />
                </div>
                <span className="cat-score">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Narrative ── */}
      <div className="card ai-card">
        <div className="ai-card-label">AI Judge Analysis</div>
        <p className="narrative">{report.narrativeFeedback}</p>
      </div>

      {/* ── Share Card ── */}
      <ShareCard report={report} projectTitle={projectTitle} />

      {/* ── Judge Questions + Improvements ── */}
      <div className="insight-grid">
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Judge May Ask...</h3>
          <ul className="insight-list">
            {report.likelyJudgeQuestions.map((q, i) => (
              <li key={i} className="insight-item">
                <span className="insight-marker">?</span>
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
                <span className="insight-marker">{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Mint section ── */}
      <div className="card mint-card">
        {canMint ? (
          <>
            <p className="mint-headline">🏅 You're eligible for a PreFlight Ready badge</p>
            <p className="mint-sub">Score {report.readinessPct}% — above the 80% threshold. Mint a soulbound NFT on Monad as proof.</p>

            {!isConnected ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <ConnectButton label="Connect Wallet to Mint" />
                <p className="input-hint">or paste your address manually:</p>
                <input
                  className="input input--mono"
                  type="text"
                  placeholder="0x..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <ConnectButton />
                <span className="input-hint">Connected — ready to mint</span>
              </div>
            )}

            <button
              className="btn btn--accent btn--lg"
              onClick={() => onMint(walletAddress)}
              disabled={minting || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)}
            >
              {minting ? "Minting on Monad..." : "✦ Mint PreFlight Badge"}
            </button>
          </>
        ) : (
          <>
            <p className="mint-headline" style={{ color: cls === "low" ? "var(--red)" : "var(--amber)" }}>
              {report.readinessPct}% — {80 - report.readinessPct} points short of badge eligibility
            </p>
            <p className="narrative">Apply the improvements above, then re-submit. Badge threshold is 80%.</p>
          </>
        )}

        <button className="btn btn--ghost" onClick={onRunAgain} style={{ marginTop: "16px", width: "100%" }}>
          ↺ Run Again
        </button>
      </div>
    </div>
  );
}
