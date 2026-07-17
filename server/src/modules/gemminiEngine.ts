import axios from "axios";
import type { RepoScanResult } from "./repoScanner";
import type { LiveAppResult } from "./liveAppChecker";
import type { ChecklistResult } from "./checklistScorer";
import type { ContractVerifyResult } from "./contractVerifier";
import type { X402Result } from "./x402Tester";

export interface GemminiContext {
  repo: RepoScanResult;
  app: LiveAppResult;
  checklist: ChecklistResult;
  contract: ContractVerifyResult;
  x402: X402Result | null;
}

export interface GemminiReport {
  overallScore: number;
  categoryScores: {
    innovation: number;
    technicalExecution: number;
    monadIntegration: number;
    businessPotential: number;
  };
  judgeConfidence: "High" | "Medium" | "Low";
  likelyJudgeQuestions: string[];
  improvementSuggestions: string[];
  narrativeFeedback: string;
  readinessPct: number;
}

export type GemminiCaller = (prompt: string) => Promise<string>;

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent";

const defaultCaller: GemminiCaller = async (prompt) => {
  try {
    const res = await axios.post(
      GEMINI_ENDPOINT,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      },
      { headers: { "x-goog-api-key": process.env.GEMMINI_API_KEY, "Content-Type": "application/json" } },
    );
    const text: string = res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response) {
      const detail = JSON.stringify(e.response.data).slice(0, 300);
      throw new Error(`Gemini API ${e.response.status}: ${detail}`);
    }
    throw e;
  }
};

function buildPrompt(ctx: GemminiContext): string {
  return `You are an expert hackathon judge. Evaluate the following project submission and return ONLY a JSON object with no extra text.

## Technical Validation Results
- checklist completion: ${ctx.checklist.completionPct}% (missing: ${ctx.checklist.missingFields.join(", ") || "none"})
- Repo eligible: ${ctx.repo.eligible}, README present: ${ctx.repo.readmePresent}, commits: ${ctx.repo.commitCount}, flags: ${ctx.repo.flags.join(", ") || "none"}
- Live app functional score: ${ctx.app.functionalScore}/100 — ${ctx.app.summary}
${ctx.contract.address ? `- Contract deployed on Monad: ${ctx.contract.deployed} (${ctx.contract.network})` : "- Contract: not applicable to this project — do NOT penalise for omitting it"}
${ctx.x402 ? `- x402 payment flow: ${ctx.x402.healthy ? "healthy" : "failing"} — steps: ${ctx.x402.steps.map(s => `${s.step}:${s.passed ? "pass" : "fail"}`).join(", ")}` : "- x402: not applicable to this project — do NOT penalise for omitting it"}

## Required JSON Output Shape
{
  "overall_score": <0-100>,
  "category_scores": { "innovation": <0-10>, "technical_execution": <0-10>, "monad_integration": <0-10>, "business_potential": <0-10> },
  "judge_confidence": "High" | "Medium" | "Low",
  "likely_judge_questions": [<string>, ...],
  "improvement_suggestions": [<string>, ...],
  "narrative_feedback": "<string>"
}`;
}

function parseResponse(raw: string): ReturnType<typeof parseGemminiJson> {
  // strip markdown code fences if model wraps output
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return parseGemminiJson(JSON.parse(cleaned));
  } catch {
    throw new Error(`Gemmini response could not be parsed as JSON: ${raw.slice(0, 120)}`);
  }
}

function parseGemminiJson(j: Record<string, unknown>) {
  return {
    overallScore:            Number(j.overall_score),
    categoryScores: {
      innovation:            Number((j.category_scores as any)?.innovation),
      technicalExecution:    Number((j.category_scores as any)?.technical_execution),
      monadIntegration:      Number((j.category_scores as any)?.monad_integration),
      businessPotential:     Number((j.category_scores as any)?.business_potential),
    },
    judgeConfidence:         j.judge_confidence as "High" | "Medium" | "Low",
    likelyJudgeQuestions:    (j.likely_judge_questions as string[]) ?? [],
    improvementSuggestions:  (j.improvement_suggestions as string[]) ?? [],
    narrativeFeedback:       String(j.narrative_feedback ?? ""),
  };
}

function computeReadiness(ctx: GemminiContext, overallScore: number): number {
  const score =
    ctx.checklist.completionPct      * 0.15 +
    (ctx.repo.eligible ? 100 : 0)    * 0.10 +
    ctx.app.functionalScore           * 0.15 +
    (ctx.contract.deployed ? 100 : 0) * 0.10 +
    overallScore                      * 0.50;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export async function runGemmini(ctx: GemminiContext, caller: GemminiCaller = defaultCaller): Promise<GemminiReport> {
  const raw = await caller(buildPrompt(ctx));
  const parsed = parseResponse(raw);
  return { ...parsed, readinessPct: computeReadiness(ctx, parsed.overallScore) };
}
