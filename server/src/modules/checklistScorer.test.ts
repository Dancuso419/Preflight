import assert from "node:assert/strict";
import { scoreChecklist } from "./checklistScorer";

const FULL: Parameters<typeof scoreChecklist>[0] = {
  title: "PreFlight",
  problemStatement: "Builders don't know how judges score them",
  solution: "AI co-judge simulation",
  githubUrl: "https://github.com/test/repo",
  demoVideoUrl: "https://youtube.com/watch?v=abc",
  contractAddress: "0xDeaDBeef",
  deploymentUrl: "https://preflight.xyz",
  category: "testnet",
  socialPostUrl: "https://x.com/test/status/1",
};

// 1 — all present → 100%
{
  const r = scoreChecklist(FULL);
  assert.equal(r.completionPct, 100);
  assert.deepEqual(r.missingFields, []);
}

// 2 — empty object → 0%, all fields missing
{
  const r = scoreChecklist({});
  assert.equal(r.completionPct, 0);
  assert.equal(r.missingFields.length, 9);
}

// 3 — whitespace-only treated as missing
{
  const r = scoreChecklist({ ...FULL, title: "   " });
  assert.ok(r.missingFields.includes("title"));
  assert.equal(r.completionPct, Math.round((8 / 9) * 100));
}

// 4 — category "mainnet" is valid
{
  const r = scoreChecklist({ ...FULL, category: "mainnet" });
  assert.equal(r.completionPct, 100);
  assert.deepEqual(r.missingFields, []);
}

// 5 — category must be testnet or mainnet (enum guard)
{
  const r = scoreChecklist({ ...FULL, category: "production" });
  assert.ok(r.missingFields.includes("category"), "invalid category should be flagged");
}

// 6 — partial fill — correct percentage
{
  const r = scoreChecklist({ title: "X", problemStatement: "Y", solution: "Z" });
  assert.equal(r.completionPct, Math.round((3 / 9) * 100));
  assert.equal(r.missingFields.length, 6);
}

console.log("checklistScorer: all tests passed");
