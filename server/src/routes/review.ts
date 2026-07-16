import { Router, Request, Response } from "express";
import { scanRepo } from "../modules/repoScanner";
import { checkLiveApp } from "../modules/liveAppChecker";
import { scoreChecklist } from "../modules/checklistScorer";
import { verifyContract } from "../modules/contractVerifier";
import { testX402 } from "../modules/x402Tester";
import { runGemmini } from "../modules/gemminiEngine";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { repoUrl, liveUrl, contractAddress, network, x402Endpoint, submission } = req.body;

  if (!repoUrl || !liveUrl || !contractAddress || !submission) {
    res.status(400).json({ error: "repoUrl, liveUrl, contractAddress, and submission are required" });
    return;
  }

  try {
    // ponytail: parallel — all validators fire simultaneously
    const [repo, app, checklist, contract, x402] = await Promise.all([
      scanRepo(repoUrl),
      checkLiveApp(liveUrl),
      scoreChecklist(submission),
      verifyContract(contractAddress, network),
      x402Endpoint ? testX402(x402Endpoint) : Promise.resolve(null),
    ]);

    const report = await runGemmini({ repo, app, checklist, contract, x402 });
    res.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Review failed";
    res.status(500).json({ error: message });
  }
});

export default router;
