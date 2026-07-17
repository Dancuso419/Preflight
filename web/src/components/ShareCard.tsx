import type { GemminiReport } from "../types";

interface Props {
  report: GemminiReport;
  projectTitle: string;
}

const CAT_LABELS: Record<string, string> = {
  innovation: "Innovation",
  technicalExecution: "Technical",
  monadIntegration: "Monad",
  businessPotential: "Business",
};

function scoreColor(pct: number) {
  return pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)";
}

function verdict(pct: number) {
  return pct >= 80 ? "PREFLIGHT READY" : pct >= 60 ? "NEEDS WORK" : "NOT READY";
}

export function ShareCard({ report, projectTitle }: Props) {
  const tweetText = encodeURIComponent(
    `"${projectTitle}" scored ${report.readinessPct}% Readiness on PreFlight — the AI co-judge for Monad hackathon builders.\n\nDon't let the first AI judge your project be the one that decides your fate. 🚀\n\n#Monad #Hackathon`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* The card itself — screenshot-able */}
      <div className="share-card">
        <div className="share-card__header">
          <span className="share-card__brand">✦ PreFlight</span>
          <span className="share-card__label">AI Judge Report</span>
        </div>

        <div className="share-card__score-row">
          <span className="share-card__score" style={{ color: scoreColor(report.readinessPct) }}>
            {report.readinessPct}%
          </span>
          <span className="share-card__verdict" style={{ borderColor: scoreColor(report.readinessPct), color: scoreColor(report.readinessPct) }}>
            {verdict(report.readinessPct)}
          </span>
        </div>

        <div className="share-card__cats">
          {Object.entries(report.categoryScores).map(([key, val]) => (
            <span key={key} className="share-card__cat-pill">
              {CAT_LABELS[key] ?? key} <strong>{val}</strong>
            </span>
          ))}
        </div>

        <div className="share-card__footer">
          <span className="share-card__project">{projectTitle}</span>
          <span className="share-card__domain">preflight.build</span>
        </div>
      </div>

      {/* Share button */}
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--ghost share-x-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Share on X
      </a>
    </div>
  );
}
