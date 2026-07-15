import assert from "node:assert/strict";
import { checkLiveApp } from "./liveAppChecker";

const fetch = (html: string) => async (_url: string) => html;
const fetchFail = async (_url: string): Promise<string> => { throw new Error("ECONNREFUSED"); };

(async () => {
  // 1 — clean real-looking HTML → score 100, no flags
  {
    const r = await checkLiveApp("https://example.com", fetch("<html><body><h1>My App</h1><p>Welcome to PreFlight</p></body></html>"));
    assert.equal(r.functionalScore, 100);
    assert.deepEqual(r.flags, []);
  }

  // 2 — lorem ipsum → flagged
  {
    const r = await checkLiveApp("https://example.com", fetch("<body>Lorem ipsum dolor sit amet</body>"));
    assert.ok(r.flags.includes("lorem_ipsum"));
    assert.ok(r.functionalScore < 100);
  }

  // 3 — "coming soon" → flagged
  {
    const r = await checkLiveApp("https://example.com", fetch("<body>Coming Soon</body>"));
    assert.ok(r.flags.includes("coming_soon"));
  }

  // 4 — "under construction" → flagged
  {
    const r = await checkLiveApp("https://example.com", fetch("<body>This site is under construction</body>"));
    assert.ok(r.flags.includes("under_construction"));
  }

  // 5 — React/Vite boilerplate text → flagged
  {
    const r = await checkLiveApp("https://example.com", fetch("<body><p>Edit src/App.tsx and save to test HMR</p></body>"));
    assert.ok(r.flags.includes("react_boilerplate"));
  }

  // 6 — Next.js boilerplate → flagged
  {
    const r = await checkLiveApp("https://example.com", fetch("<body>Get started by editing pages/index.js</body>"));
    assert.ok(r.flags.includes("nextjs_boilerplate"));
  }

  // 7 — multiple flags compound the score reduction
  {
    const r = await checkLiveApp("https://example.com", fetch(
      "<body>Lorem ipsum. Coming Soon. Under construction.</body>"
    ));
    assert.ok(r.flags.length >= 3);
    assert.ok(r.functionalScore <= 40, `expected ≤40, got ${r.functionalScore}`);
  }

  // 8 — unreachable URL → score 0, flag "unreachable", no throw
  {
    const r = await checkLiveApp("https://example.com", fetchFail);
    assert.equal(r.functionalScore, 0);
    assert.ok(r.flags.includes("unreachable"));
  }

  // 9 — summary is a non-empty string
  {
    const r = await checkLiveApp("https://example.com", fetch("<body>Coming Soon</body>"));
    assert.ok(typeof r.summary === "string" && r.summary.length > 0);
  }

  // 10 — case-insensitive matching
  {
    const r = await checkLiveApp("https://example.com", fetch("<body>LOREM IPSUM</body>"));
    assert.ok(r.flags.includes("lorem_ipsum"));
  }

  console.log("liveAppChecker: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
