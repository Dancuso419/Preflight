import { Router, Request, Response } from "express";
import { mintAttestation } from "../modules/attestationMinter";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { walletAddress, report } = req.body;
  const result = await mintAttestation(walletAddress, report);
  res.json(result);
});

export default router;
