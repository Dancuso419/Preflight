import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./lib/wagmi";
import { InputForm } from "./components/InputForm";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { BadgeViewer } from "./components/BadgeViewer";
import type { ReviewInputs, GemminiReport } from "./types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function App() {
  const [report, setReport] = useState<GemminiReport | null>(null);
  const [badge, setBadge] = useState<{ txHash: string; tokenId: string; explorerLink: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  async function runReview(inputs: ReviewInputs) {
    setLoading(true);
    const res = await fetch(`${API}/api/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    setReport(await res.json());
    setLoading(false);
  }

  async function mintBadge() {
    if (!report) return;
    setMinting(true);
    // TODO: inject connected wallet address from Para/wagmi
    const res = await fetch(`${API}/api/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: "0x...", report }),
    });
    setBadge(await res.json());
    setMinting(false);
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <main>
        <h1>PreFlight</h1>
        <p>Meet your AI co-judge before the real judge does.</p>
        {!report && <InputForm onSubmit={runReview} loading={loading} />}
        {report && !badge && <ResultsDashboard report={report} onMint={mintBadge} minting={minting} />}
        {badge && <BadgeViewer {...badge} score={report!.readinessPct} />}
      </main>
    </WagmiProvider>
  );
}

export default App;
