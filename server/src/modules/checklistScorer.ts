// TRD 3.3 — Checklist Scorer
// Required: must be present for a valid submission
const REQUIRED_FIELDS = ["title", "problemStatement", "solution", "githubUrl", "deploymentUrl", "category"] as const;
// Optional: boosts completionPct if present but never penalised if missing
const OPTIONAL_FIELDS = ["demoVideoUrl", "contractAddress", "socialPostUrl"] as const;

type AllFields = typeof REQUIRED_FIELDS[number] | typeof OPTIONAL_FIELDS[number];
export type SubmissionFields = Partial<Record<AllFields, string>>;

export interface ChecklistResult {
  completionPct: number;
  missingFields: string[];
}

const VALID_CATEGORIES = new Set(["testnet", "mainnet"]);

function hasValue(fields: SubmissionFields, f: AllFields): boolean {
  const v = fields[f]?.trim();
  if (!v) return false;
  if (f === "category") return VALID_CATEGORIES.has(v);
  return true;
}

export function scoreChecklist(fields: SubmissionFields): ChecklistResult {
  const missingRequired = REQUIRED_FIELDS.filter((f) => !hasValue(fields, f));
  const presentOptional = OPTIONAL_FIELDS.filter((f) => hasValue(fields, f));

  // Required fields are worth 80% of the score, optional 20%
  const requiredScore = ((REQUIRED_FIELDS.length - missingRequired.length) / REQUIRED_FIELDS.length) * 80;
  const optionalScore = (presentOptional.length / OPTIONAL_FIELDS.length) * 20;

  return {
    completionPct: Math.round(requiredScore + optionalScore),
    missingFields: missingRequired,
  };
}
