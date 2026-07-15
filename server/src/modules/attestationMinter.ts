import { createWalletClient, createPublicClient, http, keccak256, toHex, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import type { GemminiReport } from "./gemminiEngine";

export interface MintResult {
  txHash: string;
  tokenId: string;
  explorerLink: string;
}

export type MintCaller = (args: {
  walletAddress: string;
  reportHash: `0x${string}`;
  readinessScore: number;
}) => Promise<{ txHash: string; tokenId: string }>;

const PREFLIGHT_VERSION = "1.0.0";

const EXPLORER: Record<string, string> = {
  testnet: "https://testnet.monadexplorer.com/tx",
  mainnet: "https://explorer.monad.xyz/tx",
};

const ABI = parseAbi([
  "function mint(address wallet, bytes32 reportHash, uint8 readinessScore, string version) returns (uint256 tokenId)",
  "event AttestationMinted(address indexed wallet, uint256 tokenId, uint8 score)",
]);

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_RPC_URL_TESTNET ?? "https://testnet-rpc.monad.xyz"] } },
});

// ponytail: default caller uses monskills agent wallet via BACKEND_SIGNER_PRIVATE_KEY env var
// To use monskills keystore: decrypt with `cast wallet decrypt-keystore` and set the key in env
const defaultCaller: MintCaller = async ({ walletAddress, reportHash, readinessScore }) => {
  const key = process.env.BACKEND_SIGNER_PRIVATE_KEY as `0x${string}`;
  if (!key) throw new Error("BACKEND_SIGNER_PRIVATE_KEY not set");

  const contractAddress = process.env.ATTESTATION_CONTRACT_ADDRESS as `0x${string}`;
  if (!contractAddress) throw new Error("ATTESTATION_CONTRACT_ADDRESS not set");

  const account = privateKeyToAccount(key);
  const walletClient = createWalletClient({ account, chain: monadTestnet, transport: http() });
  const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: ABI,
    functionName: "mint",
    args: [walletAddress as `0x${string}`, reportHash, readinessScore, PREFLIGHT_VERSION],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const log = receipt.logs.find((l) => l.topics[0] && l.address.toLowerCase() === contractAddress.toLowerCase());
  // tokenId is the second topic on AttestationMinted (first indexed arg is wallet)
  const tokenId = log?.topics[2] ? BigInt(log.topics[2]).toString() : "unknown";

  return { txHash, tokenId };
};

export async function mintAttestation(
  walletAddress: string,
  report: GemminiReport,
  caller: MintCaller = defaultCaller,
): Promise<MintResult> {
  if (report.readinessPct < 80)
    throw new Error(`Readiness score ${report.readinessPct}% is below 80% — minting blocked`);

  const reportHash = keccak256(toHex(JSON.stringify(report)));
  const { txHash, tokenId } = await caller({ walletAddress, reportHash, readinessScore: report.readinessPct });

  return {
    txHash,
    tokenId,
    explorerLink: `${EXPLORER.testnet}/${txHash}`,
  };
}
