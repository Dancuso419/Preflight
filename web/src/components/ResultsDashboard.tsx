// TRD 4.2 — Results Dashboard
import type { GemminiReport } from "../types";

interface Props {
  report: GemminiReport;
  onMint: () => void;
  minting: boolean;
}

export function ResultsDashboard({ report, onMint, minting }: Props) {
  // TODO: implement per TRD 4.2 — readiness score, category bars, judge breakdown, suggestions, x402 panel
  return (
    <div>
      <h2>Readiness: {report.readinessPct}%</h2>
      <h3>Score: {report.overallScore} / 100</h3>
      {report.readinessPct >= 80 && (
        <button onClick={onMint} disabled={minting}>
          {minting ? "Minting..." : "Mint Monad Badge"}
        </button>
      )}
    </div>
  );
}
