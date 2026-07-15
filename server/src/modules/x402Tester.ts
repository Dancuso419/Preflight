import axios from "axios";

export interface X402StepResult {
  step: string;
  passed: boolean;
  reason?: string;
}

export interface X402Result {
  steps: X402StepResult[];
  healthy: boolean;
  failureReasons: string[];
}

interface X402Invoice {
  scheme: string;
  price: string;
  network: string;
  facilitator: string;
}

export type Requester = (
  method: string,
  url: string,
  headers?: Record<string, string>,
) => Promise<{ status: number; data: unknown }>;

export type PaymentSigner    = (invoice: X402Invoice) => string;
export type FacilitatorChecker = (address: string) => Promise<boolean>;

const MONAD_NETWORKS = new Set(["monad-testnet", "monad-mainnet"]);

const INVOICE_FIELDS = ["scheme", "price", "network", "facilitator"] as const;

const defaultRequester: Requester = async (method, url, headers) => {
  const res = await axios({ method, url, headers, validateStatus: () => true });
  return { status: res.status, data: res.data };
};

// ponytail: signer stub — real signing wired when monskills wallet is ready
const defaultSigner: PaymentSigner = (_invoice) => {
  const key = process.env.BACKEND_SIGNER_PRIVATE_KEY;
  if (!key) throw new Error("BACKEND_SIGNER_PRIVATE_KEY not set");
  return `x402-stub:${key.slice(0, 6)}`; // replaced by real ERC-3009 sig
};

const defaultFacilitatorChecker: FacilitatorChecker = async (address) => {
  const { verifyContract } = await import("./contractVerifier");
  const r = await verifyContract(address, "testnet");
  return r.deployed;
};

function pass(step: string): X402StepResult { return { step, passed: true }; }
function fail(step: string, reason: string): X402StepResult { return { step, passed: false, reason }; }

export async function testX402(
  endpointUrl: string,
  options: {
    requester?: Requester;
    signer?: PaymentSigner;
    facilitatorChecker?: FacilitatorChecker;
  } = {},
): Promise<X402Result> {
  const {
    requester = defaultRequester,
    signer = defaultSigner,
    facilitatorChecker = defaultFacilitatorChecker,
  } = options;

  const steps: X402StepResult[] = [];

  // Step 1 — Handshake
  let invoice: X402Invoice;
  try {
    const res = await requester("GET", endpointUrl);
    if (res.status !== 402) {
      steps.push(fail("handshake", `Expected 402, got ${res.status}`));
      return done(steps);
    }
    const body = res.data as Record<string, unknown>;
    const missing = INVOICE_FIELDS.filter((f) => !body[f]);
    if (missing.length) {
      steps.push(fail("handshake", `Missing invoice fields: ${missing.join(", ")}`));
      return done(steps);
    }
    invoice = body as unknown as X402Invoice;
    steps.push(pass("handshake"));
  } catch (e: any) {
    steps.push(fail("handshake", e.message));
    return done(steps);
  }

  // Step 2 — Payment retry
  const paymentHeader = signer(invoice);
  try {
    const res = await requester("GET", endpointUrl, { "X-Payment": paymentHeader });
    steps.push(res.status === 200
      ? pass("payment_retry")
      : fail("payment_retry", `Expected 200, got ${res.status}`));
  } catch (e: any) {
    steps.push(fail("payment_retry", e.message));
  }

  // Step 3 — Facilitator check
  const deployed = await facilitatorChecker(invoice.facilitator).catch(() => false);
  steps.push(deployed
    ? pass("facilitator_check")
    : fail("facilitator_check", `Facilitator ${invoice.facilitator} not deployed on Monad`));

  // Step 4 — Replay guard (reuse same payment header)
  try {
    const res = await requester("GET", endpointUrl, { "X-Payment": paymentHeader });
    const rejected = res.status === 402 || res.status === 400;
    steps.push(rejected
      ? pass("replay_guard")
      : fail("replay_guard", `Replay accepted (${res.status}) — replay guard missing`));
  } catch (e: any) {
    steps.push(fail("replay_guard", e.message));
  }

  // Step 5 — Network check (declared network must be a recognised Monad network)
  steps.push(MONAD_NETWORKS.has(invoice.network)
    ? pass("network_check")
    : fail("network_check", `Unknown network: ${invoice.network}`));

  return done(steps);
}

function done(steps: X402StepResult[]): X402Result {
  const failureReasons = steps.filter((s) => !s.passed).map((s) => s.reason ?? s.step);
  return { steps, healthy: failureReasons.length === 0, failureReasons };
}
