import { Router, Request, Response } from "express";
import { mintAttestation } from "../modules/attestationMinter";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { walletAddress, report } = req.body;

  if (!walletAddress || !report) {
    res.status(400).json({ error: "walletAddress and report are required" });
    return;
  }

  try {
    const result = await mintAttestation(walletAddress, report);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Mint failed";
    const status = message.includes("below 80%") ? 422 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
