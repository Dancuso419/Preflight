import { Router, Request, Response } from "express";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

const router = Router();

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_RPC_URL_TESTNET ?? "https://testnet-rpc.monad.xyz"] } },
});

const ABI = parseAbi([
  "function getAttestation(address wallet) view returns (bytes32 reportHash, uint8 readinessScore, uint64 timestamp, string version)",
]);

router.get("/:wallet", async (req: Request, res: Response) => {
  const wallet = req.params["wallet"] as string;

  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    res.status(400).json({ error: "Invalid wallet address" });
    return;
  }

  const contractAddress = process.env.ATTESTATION_CONTRACT_ADDRESS as `0x${string}`;
  if (!contractAddress) {
    res.status(500).json({ error: "ATTESTATION_CONTRACT_ADDRESS not configured" });
    return;
  }

  try {
    const client = createPublicClient({ chain: monadTestnet, transport: http() });
    const [reportHash, readinessScore, timestamp, version] = await client.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: "getAttestation",
      args: [wallet as `0x${string}`],
    });

    res.json({
      wallet,
      reportHash,
      readinessScore,
      timestamp: Number(timestamp),
      version,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("No attestation found")) {
      res.status(404).json({ error: "No attestation found for this wallet" });
    } else {
      res.status(500).json({ error: "Failed to fetch attestation" });
    }
  }
});

export default router;
