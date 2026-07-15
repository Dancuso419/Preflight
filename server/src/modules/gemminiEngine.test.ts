import assert from "node:assert/strict";
import { runGemmini } from "./gemminiEngine";
import type { GemminiContext } from "./gemminiEngine";

// --- fixtures ---

const CTX: GemminiContext = {
  repo:      { eligible: true,  readmePresent: true,  commitCount: 15, firstCommitDate: "2025-07-14T00:00:00Z", flags: [] },
  app:       { functionalScore: 80, flags: [], summary: "No placeholders found." },
  checklist: { completionPct: 100, missingFields: [] },
  contract:  { deployed: true,  network: "testnet", address: "0xAbCd" },
  x402:      null,
};

const VALID_RESPONSE = {
  overall_score: 80,
  category_scores: { innovation: 8.0, technical_execution: 7.5, monad_integration: 9.0, business_potential: 7.0 },
  judge_confidence: "High",
  likely_judge_questions: ["Why Monad?", "How does this scale?"],
  improvement_suggestions: ["Add architecture diagram"],
  narrative_feedback: "Strong project with clear Monad integration.",
};

const caller = (response: object) => async (_prompt: string) => JSON.stringify(response);

(async () => {
  // 1 — happy path: all fields present in report
  {
    const r = await runGemmini(CTX, caller(VALID_RESPONSE));
    assert.equal(r.overallScore,        VALID_RESPONSE.overall_score);
    assert.equal(r.judgeConfidence,     "High");
    assert.deepEqual(r.likelyJudgeQuestions, VALID_RESPONSE.likely_judge_questions);
    assert.deepEqual(r.improvementSuggestions, VALID_RESPONSE.improvement_suggestions);
    assert.equal(r.narrativeFeedback,   VALID_RESPONSE.narrative_feedback);
    assert.ok(typeof r.categoryScores.innovation        === "number");
    assert.ok(typeof r.categoryScores.technicalExecution === "number");
    assert.ok(typeof r.categoryScores.monadIntegration  === "number");
    assert.ok(typeof r.categoryScores.businessPotential === "number");
  }

  // 2 — readinessPct formula: checklist(15) + repo(10) + app(15) + contract(10) + gemmini(50)
  // CTX: checklist=100, eligible=true, app=80, deployed=true, score=80
  // = 100*0.15 + 100*0.10 + 80*0.15 + 100*0.10 + 80*0.50
  // = 15 + 10 + 12 + 10 + 40 = 87
  {
    const r = await runGemmini(CTX, caller(VALID_RESPONSE));
    assert.equal(r.readinessPct, 87, `expected 87, got ${r.readinessPct}`);
  }

  // 3 — readinessPct drops when contract not deployed and repo ineligible
  {
    const ctx: GemminiContext = {
      ...CTX,
      repo:     { ...CTX.repo,     eligible: false },
      contract: { ...CTX.contract, deployed: false },
    };
    const r = await runGemmini(ctx, caller(VALID_RESPONSE));
    // checklist=100*0.15 + eligible=0*0.10 + app=80*0.15 + deployed=0*0.10 + score=80*0.50
    // = 15 + 0 + 12 + 0 + 40 = 67
    assert.equal(r.readinessPct, 67, `expected 67, got ${r.readinessPct}`);
  }

  // 4 — caller receives a non-empty prompt containing context data
  {
    let captured = "";
    await runGemmini(CTX, async (prompt) => { captured = prompt; return JSON.stringify(VALID_RESPONSE); });
    assert.ok(captured.length > 0, "prompt should be non-empty");
    assert.ok(captured.includes("checklist"), "prompt should mention checklist");
    assert.ok(captured.includes("eligible"),  "prompt should mention eligibility");
  }

  // 5 — x402 context included in prompt when provided
  {
    const ctxWithX402: GemminiContext = {
      ...CTX,
      x402: { steps: [], healthy: true, failureReasons: [] },
    };
    let captured = "";
    await runGemmini(ctxWithX402, async (prompt) => { captured = prompt; return JSON.stringify(VALID_RESPONSE); });
    assert.ok(captured.includes("x402"), "prompt should include x402 context");
  }

  // 6 — JSON wrapped in markdown code block → still parsed correctly
  {
    const wrapped = `\`\`\`json\n${JSON.stringify(VALID_RESPONSE)}\n\`\`\``;
    const r = await runGemmini(CTX, async () => wrapped);
    assert.equal(r.overallScore, VALID_RESPONSE.overall_score);
  }

  // 7 — malformed JSON from Gemmini → throws descriptive error
  {
    try {
      await runGemmini(CTX, async () => "this is not json at all");
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.ok(e.message.toLowerCase().includes("gemmini"), `got: ${e.message}`);
    }
  }

  // 8 — readinessPct clamped to 0–100
  {
    const highScore = { ...VALID_RESPONSE, overall_score: 100 };
    const r = await runGemmini(CTX, caller(highScore));
    assert.ok(r.readinessPct >= 0 && r.readinessPct <= 100, `out of range: ${r.readinessPct}`);
  }

  console.log("gemminiEngine: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
