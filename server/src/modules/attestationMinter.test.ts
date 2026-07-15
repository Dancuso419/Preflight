import assert from "node:assert/strict";
import { mintAttestation } from "./attestationMinter";
import type { GemminiReport } from "./gemminiEngine";

const WALLET = "0xDeAdBeEf00000000000000000000000000000001";

const report = (readinessPct: number): GemminiReport => ({
  overallScore: 85,
  categoryScores: { innovation: 8, technicalExecution: 8, monadIntegration: 9, businessPotential: 7 },
  judgeConfidence: "High",
  likelyJudgeQuestions: ["Why Monad?"],
  improvementSuggestions: ["Add diagram"],
  narrativeFeedback: "Strong project.",
  readinessPct,
});

const TX   = "0xabc123def456" as `0x${string}`;
const TOKEN = "42";

// fake mint caller — captures args, returns canned result
function makeCaller(capture: { address?: string; score?: number; hash?: string } = {}) {
  return async (args: { walletAddress: string; reportHash: `0x${string}`; readinessScore: number }) => {
    capture.address = args.walletAddress;
    capture.score   = args.readinessScore;
    capture.hash    = args.reportHash;
    return { txHash: TX, tokenId: TOKEN };
  };
}

(async () => {
  // 1 — score < 80 → blocked before caller is ever invoked
  {
    let called = false;
    const caller = async () => { called = true; return { txHash: TX, tokenId: TOKEN }; };
    try {
      await mintAttestation(WALLET, report(79), caller);
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.ok(e.message.includes("80"), `got: ${e.message}`);
      assert.equal(called, false, "caller should not have been invoked");
    }
  }

  // 2 — score exactly 80 → allowed
  {
    const r = await mintAttestation(WALLET, report(80), makeCaller());
    assert.ok(r.txHash.length > 0);
  }

  // 3 — returns txHash, tokenId, explorerLink
  {
    const r = await mintAttestation(WALLET, report(90), makeCaller());
    assert.equal(r.txHash,    TX);
    assert.equal(r.tokenId,   TOKEN);
    assert.ok(r.explorerLink.includes(TX), `explorerLink should contain txHash: ${r.explorerLink}`);
  }

  // 4 — caller receives correct walletAddress and readinessScore
  {
    const cap: { address?: string; score?: number } = {};
    await mintAttestation(WALLET, report(85), makeCaller(cap));
    assert.equal(cap.address, WALLET);
    assert.equal(cap.score,   85);
  }

  // 5 — reportHash is keccak256-shaped (0x + 64 hex chars) and deterministic
  {
    const cap1: { hash?: string } = {};
    const cap2: { hash?: string } = {};
    const r = report(90);
    await mintAttestation(WALLET, r, makeCaller(cap1));
    await mintAttestation(WALLET, r, makeCaller(cap2));
    assert.ok(/^0x[0-9a-f]{64}$/i.test(cap1.hash!), `bad hash format: ${cap1.hash}`);
    assert.equal(cap1.hash, cap2.hash, "same report should produce same hash");
  }

  // 6 — different reports produce different hashes
  {
    const cap1: { hash?: string } = {};
    const cap2: { hash?: string } = {};
    await mintAttestation(WALLET, report(80), makeCaller(cap1));
    await mintAttestation(WALLET, report(95), makeCaller(cap2));
    assert.notEqual(cap1.hash, cap2.hash, "different reports should produce different hashes");
  }

  // 7 — caller failure → throws, does not swallow
  {
    const failCaller = async () => { throw new Error("RPC timeout"); };
    try {
      await mintAttestation(WALLET, report(90), failCaller);
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.ok(e.message.includes("RPC timeout") || e.message.includes("mint"), `got: ${e.message}`);
    }
  }

  console.log("attestationMinter: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
