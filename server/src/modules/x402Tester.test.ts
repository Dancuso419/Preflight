import assert from "node:assert/strict";
import { testX402 } from "./x402Tester";

// --- helpers ---

const INVOICE = {
  scheme: "exact",
  price: "1000000",
  network: "monad-testnet",
  facilitator: "0xDeAdBeEf00000000000000000000000000001234",
};

// sequential HTTP responses — each call pops the next response
function makeRequester(responses: Array<{ status: number; data: unknown }>) {
  let i = 0;
  return async (_method: string, _url: string, _headers?: Record<string, string>) => {
    if (i >= responses.length) throw new Error(`Unexpected request #${i + 1}`);
    return responses[i++];
  };
}

const dummySigner    = (_invoice: unknown) => "dummy-payment-header";
const facilitatorOk  = async (_addr: string) => true;
const facilitatorBad = async (_addr: string) => false;

// happy-path: 402 handshake → 200 payment → 402 replay
const happyRequester = () => makeRequester([
  { status: 402, data: INVOICE },
  { status: 200, data: { resource: "granted" } },
  { status: 402, data: { error: "already used" } },
]);

(async () => {
  // 1 — happy path: all 5 steps pass
  {
    const r = await testX402("https://example.com/api", {
      requester: happyRequester(), signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    assert.equal(r.healthy, true, `expected healthy, got: ${JSON.stringify(r.failureReasons)}`);
    assert.equal(r.steps.length, 5);
    assert.ok(r.steps.every(s => s.passed), `failing steps: ${r.steps.filter(s => !s.passed).map(s => s.step).join(", ")}`);
  }

  // 2 — step 1 fails: server returns 200 instead of 402 → short-circuit, healthy false
  {
    const r = await testX402("https://example.com/api", {
      requester: makeRequester([{ status: 200, data: {} }]),
      signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    assert.equal(r.healthy, false);
    assert.equal(r.steps[0].step, "handshake");
    assert.equal(r.steps[0].passed, false);
  }

  // 3 — step 1 fails: 402 but missing invoice fields → short-circuit
  {
    const r = await testX402("https://example.com/api", {
      requester: makeRequester([{ status: 402, data: { scheme: "exact" } }]), // missing price, network, facilitator
      signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    assert.equal(r.healthy, false);
    assert.ok(r.steps[0].reason?.includes("Missing"), `reason: ${r.steps[0].reason}`);
  }

  // 4 — step 2 fails: payment rejected (server returns 402 even with X-Payment)
  {
    const r = await testX402("https://example.com/api", {
      requester: makeRequester([
        { status: 402, data: INVOICE },
        { status: 402, data: { error: "bad payment" } },
        { status: 402, data: {} }, // replay (still 402)
      ]),
      signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    assert.equal(r.steps.find(s => s.step === "payment_retry")?.passed, false);
    assert.equal(r.healthy, false);
  }

  // 5 — step 3 fails: facilitator not deployed on Monad
  {
    const r = await testX402("https://example.com/api", {
      requester: happyRequester(), signer: dummySigner, facilitatorChecker: facilitatorBad,
    });
    assert.equal(r.steps.find(s => s.step === "facilitator_check")?.passed, false);
    assert.equal(r.healthy, false);
  }

  // 6 — step 4 fails: replay accepted (server returns 200 again) → replay guard broken
  {
    const r = await testX402("https://example.com/api", {
      requester: makeRequester([
        { status: 402, data: INVOICE },
        { status: 200, data: {} }, // payment accepted
        { status: 200, data: {} }, // replay also accepted — BAD
      ]),
      signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    const replayStep = r.steps.find(s => s.step === "replay_guard")!;
    assert.equal(replayStep.passed, false, "replay guard should have failed");
    assert.ok(replayStep.reason?.includes("replay"), `reason: ${replayStep.reason}`);
  }

  // 7 — step 5 fails: unknown network in invoice
  {
    const badInvoice = { ...INVOICE, network: "ethereum-mainnet" };
    const r = await testX402("https://example.com/api", {
      requester: makeRequester([
        { status: 402, data: badInvoice },
        { status: 200, data: {} },
        { status: 402, data: {} },
      ]),
      signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    assert.equal(r.steps.find(s => s.step === "network_check")?.passed, false);
    assert.equal(r.healthy, false);
  }

  // 8 — failureReasons lists all failed step reasons
  {
    const r = await testX402("https://example.com/api", {
      requester: makeRequester([
        { status: 402, data: INVOICE },
        { status: 402, data: {} }, // payment rejected
        { status: 200, data: {} }, // replay accepted — bad
      ]),
      signer: dummySigner, facilitatorChecker: facilitatorBad, // facilitator also bad
    });
    assert.ok(r.failureReasons.length >= 3, `expected ≥3 failures, got ${r.failureReasons.length}`);
  }

  // 9 — endpoint unreachable on handshake → graceful failure, no throw
  {
    const r = await testX402("https://example.com/api", {
      requester: async () => { throw new Error("ECONNREFUSED"); },
      signer: dummySigner, facilitatorChecker: facilitatorOk,
    });
    assert.equal(r.healthy, false);
    assert.equal(r.steps[0].passed, false);
  }

  console.log("x402Tester: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
