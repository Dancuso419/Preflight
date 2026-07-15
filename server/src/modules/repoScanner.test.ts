import assert from "node:assert/strict";
import { scanRepo } from "./repoScanner";

const AFTER  = "2025-07-14T10:00:00Z";
const BEFORE = "2025-07-01T10:00:00Z";

const commit = (date: string) => ({ commit: { committer: { date } } });

function makeFetcher(commits: object[], readmeExists = true) {
  return async (url: string) => {
    if (url.includes("/commits"))           return commits;
    if (url.includes("/contents/README")) {
      if (!readmeExists) throw Object.assign(new Error("Not Found"), { status: 404 });
      return { name: "README.md" };
    }
    throw new Error(`Unmocked URL: ${url}`);
  };
}

(async () => {
  // 1 — eligible when oldest commit is after hackathon start
  {
    const r = await scanRepo("https://github.com/a/b", makeFetcher([commit(AFTER), commit(AFTER)]));
    assert.equal(r.eligible, true, "should be eligible");
  }

  // 2 — ineligible when oldest commit is before hackathon start
  // GitHub returns newest-first, so last item = first commit chronologically
  {
    const r = await scanRepo("https://github.com/a/b", makeFetcher([commit(AFTER), commit(BEFORE)]));
    assert.equal(r.eligible, false, "should be ineligible");
  }

  // 3 — README present
  {
    const r = await scanRepo("https://github.com/a/b", makeFetcher([commit(AFTER)]));
    assert.equal(r.readmePresent, true);
  }

  // 4 — README absent
  {
    const r = await scanRepo("https://github.com/a/b", makeFetcher([commit(AFTER)], false));
    assert.equal(r.readmePresent, false);
  }

  // 5 — single-commit repo flagged
  {
    const r = await scanRepo("https://github.com/a/b", makeFetcher([commit(AFTER)]));
    assert.ok(r.flags.includes("single_commit"), "single commit should be flagged");
  }

  // 6 — bulk import: 12 commits all within 30 min
  {
    const closeCommits = Array.from({ length: 12 }, (_, i) =>
      commit(new Date(new Date(AFTER).getTime() + i * 60_000).toISOString())
    );
    const r = await scanRepo("https://github.com/a/b", makeFetcher(closeCommits));
    assert.ok(r.flags.includes("bulk_import"), "dense commits should be flagged");
  }

  // 7 — correct commitCount and firstCommitDate
  {
    const commits = [commit(AFTER), commit("2025-07-13T15:00:00Z"), commit("2025-07-13T14:00:00Z")];
    const r = await scanRepo("https://github.com/a/b", makeFetcher(commits));
    assert.equal(r.commitCount, 3);
    assert.equal(r.firstCommitDate, "2025-07-13T14:00:00Z");
  }

  // 8 — non-GitHub URL throws
  {
    try {
      await scanRepo("https://gitlab.com/a/b");
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.ok(e.message.includes("Invalid GitHub URL"), `got: ${e.message}`);
    }
  }

  console.log("repoScanner: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
