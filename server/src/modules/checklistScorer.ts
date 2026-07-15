// TRD 3.3 — Checklist Scorer
const REQUIRED_FIELDS = [
  "title", "problemStatement", "solution", "githubUrl",
  "demoVideoUrl", "contractAddress", "deploymentUrl", "category", "socialPostUrl",
] as const;

export type SubmissionFields = Partial<Record<typeof REQUIRED_FIELDS[number], string>>;

export interface ChecklistResult {
  completionPct: number;
  missingFields: string[];
}

const VALID_CATEGORIES = new Set(["testnet", "mainnet"]);

export function scoreChecklist(fields: SubmissionFields): ChecklistResult {
  const missing = REQUIRED_FIELDS.filter((f) => {
    const v = fields[f]?.trim();
    if (!v) return true;
    if (f === "category") return !VALID_CATEGORIES.has(v);
    return false;
  });
  return {
    completionPct: Math.round(((REQUIRED_FIELDS.length - missing.length) / REQUIRED_FIELDS.length) * 100),
    missingFields: missing,
  };
}
