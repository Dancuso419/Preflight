import { Router, Request, Response } from "express";
import { scanRepo, type RepoScanResult } from "../modules/repoScanner";
import { checkLiveApp, type LiveAppResult } from "../modules/liveAppChecker";
import { scoreChecklist } from "../modules/checklistScorer";
import { verifyContract, type ContractVerifyResult } from "../modules/contractVerifier";
import { testX402 } from "../modules/x402Tester";
import { runGemmini } from "../modules/gemminiEngine";

const router = Router();

// Fallbacks used when a module is skipped or errors
const FALLBACK_REPO: RepoScanResult     = { eligible: false, readmePresent: false, commitCount: 0, firstCommitDate: null, flags: ["scan_failed"] };
const FALLBACK_APP: LiveAppResult       = { functionalScore: 0, summary: "Skipped", flags: [] };
const FALLBACK_CONTRACT: ContractVerifyResult = { deployed: false, network: "testnet", address: "" };

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); }
  catch (e) {
    console.error(`[${label}] ${e instanceof Error ? e.message : e}`);
    return fallback;
  }
}

router.post("/", async (req: Request, res: Response) => {
  const { repoUrl, liveUrl, contractAddress, network, x402Endpoint, submission } = req.body;

  if (!repoUrl || !submission) {
    res.status(400).json({ error: "repoUrl and submission are required" });
    return;
  }

  try {
    const net = (network === "mainnet" ? "mainnet" : "testnet") as "testnet" | "mainnet";

    // All validators fire in parallel; individual failures degrade gracefully
    const [repo, app, checklist, contract, x402] = await Promise.all([
      safe("repoScanner",      () => scanRepo(repoUrl),                          FALLBACK_REPO),
      safe("liveAppChecker",   () => liveUrl ? checkLiveApp(liveUrl) : Promise.resolve(FALLBACK_APP), FALLBACK_APP),
      safe("checklistScorer",  () => Promise.resolve(scoreChecklist(submission)), { completionPct: 0, missingFields: [] }),
      safe("contractVerifier", () => contractAddress ? verifyContract(contractAddress, net) : Promise.resolve({ ...FALLBACK_CONTRACT, network: net }), FALLBACK_CONTRACT),
      safe("x402Tester",       () => x402Endpoint ? testX402(x402Endpoint) : Promise.resolve(null), null),
    ]);

    const report = await runGemmini({ repo, app, checklist, contract, x402 });
    res.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Review failed";
    console.error("[review]", message);
    res.status(500).json({ error: message });
  }
});

export default router;
