import { useState } from "react";

interface Props {
  txHash: string;
  tokenId: string;
  explorerLink: string;
  score: number;
  onReset: () => void;
}

function truncate(s: string, start = 8, end = 6): string {
  if (s.length <= start + end + 3) return s;
  return `${s.slice(0, start)}...${s.slice(-end)}`;
}

export function BadgeViewer({ txHash, tokenId, explorerLink, score, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(explorerLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback: do nothing (clipboard blocked)
    }
  }

  return (
    <div className="badge-page">
      <div className="badge-card-wrap">
        <div className="badge-card">
          <div className="badge-icon" aria-hidden="true">✈</div>

          <div>
            <div className="badge-title">PreFlight Ready</div>
            <div className="badge-monad" style={{ marginTop: "8px" }}>Verified on Monad</div>
          </div>

          <div className="badge-score-pill" aria-label={`Readiness score: ${score}%`}>
            {score}%
          </div>

          <div className="badge-token">Token #{tokenId}</div>

          <div className="badge-meta">
            <div className="badge-meta-row">
              <span className="badge-meta-key">Version</span>
              <span className="badge-meta-val">PreFlight v1.0.0</span>
            </div>
            <div className="badge-meta-row">
              <span className="badge-meta-key">TX</span>
              <span className="badge-meta-val" title={txHash}>{truncate(txHash)}</span>
            </div>
            <div className="badge-meta-row">
              <span className="badge-meta-key">Network</span>
              <span className="badge-meta-val">Monad Testnet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="badge-actions">
        <a
          href={explorerLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn--primary"
        >
          ↗ View on Explorer
        </a>
        <button className="btn btn--yellow" onClick={copyLink}>
          {copied ? "✓ Copied!" : "⎘ Copy Link"}
        </button>
        <button className="btn btn--ghost" onClick={onReset}>
          ← Run Another Project
        </button>
      </div>

      {/* Closing line */}
      <blockquote className="badge-closing">
        "Don't let the first AI judge your project be the one that decides your fate."
      </blockquote>

      {/* Toast */}
      {copied && (
        <div className="toast" role="status" aria-live="polite">
          Explorer link copied to clipboard
        </div>
      )}
    </div>
  );
}
