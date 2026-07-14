import { Router, Request, Response } from "express";

const router = Router();

router.get("/:wallet", async (req: Request, res: Response) => {
  // TODO: query Monad via Monskills for existing attestation
  const { wallet } = req.params;
  res.json({ wallet, attestation: null });
});

export default router;
