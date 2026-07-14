# PreFlight — Claude Guidelines

## Project Summary

**PreFlight** is an AI-powered pre-submission review platform for hackathon builders. It simulates AI judging, validates x402 payment flows, verifies Monad smart contracts, and mints onchain attestations on Monad.

**Tagline:** Meet your AI co-judge before the real judge does.

---

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React (single-page app)                 |
| Backend    | Node.js + Express                       |
| AI         | Gemmini API (fine-tuned model)          |
| Blockchain | Monad testnet/mainnet via **Monskills** |
| Payments   | x402 protocol + native USDC on Monad   |
| External   | GitHub API, HTTP Fetch                  |

---

## Skills and Plugins to Use

- **monskills** — always use for all Monad blockchain work: contract deployment, RPC calls, attestation minting, wallet interactions, USDC addresses, and anything Monad-related. Load via `Skill` tool before touching any blockchain code.
- **superpowers:brainstorming** — before building any new feature or module.
- **superpowers:systematic-debugging** — before proposing any fix.
- **superpowers:test-driven-development** — before writing implementation code.
- **impeccable / design-taste-frontend** — for all frontend UI work on the results dashboard, badge viewer, and input form.
- **ponytail** — active in this session; no over-engineering, no speculative abstractions.

---

## Architecture Rules

- **All validation logic lives in the backend.** Frontend is input + display only.
- **Wallet connection is client-side only** (Monad wallet connect).
- **Gemmini is called once per review**, after all technical validators complete in parallel.
- **Never expose raw Gemmini API response to the client** — parse JSON on backend, pass structured result.
- **Attestation minting triggers only when readiness score ≥ 80%.**
- Mint function is callable only from the backend signer wallet.

---

## Backend Modules (Build Order)

1. **Checklist Scorer** — validates submission fields (no external deps)
2. **Repo Scanner** — GitHub API, commit history, README check
3. **Contract Verifier** — Monad RPC bytecode check
4. **Live App Checker** — HTTP fetch + placeholder pattern matching
5. **Gemmini Reasoning Engine** — aggregates all module outputs, calls Gemmini
6. **Attestation Minter** — Monskills + Monad onchain badge mint
7. **x402 Tester** — 5-step end-to-end payment flow simulation
8. **Frontend Dashboard + Badge Viewer**
9. **Re-run flow + shareable card**

---

## API Routes

| Method | Route                        | Purpose                                      |
|--------|------------------------------|----------------------------------------------|
| POST   | `/api/review`                | Run all modules + Gemmini, return full report |
| POST   | `/api/mint`                  | Mint attestation badge on Monad               |
| GET    | `/api/attestation/:wallet`   | Look up existing attestation by wallet        |

---

## Key Constants (Monad)

- **Testnet USDC:** `0x534b2f3A21130d7a60830c2Df862319e593943A3`
- **Mainnet USDC:** `0x754704Bc059F8C67012fEd69BC8A327a5aafb603`
- **Hackathon start:** `2025-07-13 13:00 UTC` (used by Repo Scanner for eligibility)

---

## Environment Variables Required

```
GITHUB_API_TOKEN
GEMMINI_API_KEY
GEMMINI_MODEL_ENDPOINT
MONAD_RPC_URL_TESTNET
MONAD_RPC_URL_MAINNET
BACKEND_SIGNER_PRIVATE_KEY
ATTESTATION_CONTRACT_ADDRESS
X402_TEST_WALLET_ADDRESS
```

Never hardcode any of these. Never commit them.

---

## x402 Tester — 5-Step Flow

1. **Handshake** — GET with no auth → expect HTTP 402 + JSON body (scheme, price, network, facilitator)
2. **Payment retry** — construct x402-compliant payload, sign with test wallet, attach as `X-Payment` header, expect 200
3. **Facilitator check** — confirm facilitator address resolves to deployed contract on Monad
4. **Replay guard** — reuse same payload, expect 402 or 400 (not 200)
5. **Mismatch check** — compare declared price/network in 402 body vs onchain settlement record

---

## Gemmini Scoring Categories

Output must include all of these — instruct model to return **JSON only**:

- `overall_score` (0–100)
- `category_scores`: innovation, technical_execution, monad_integration, business_potential
- `judge_confidence`: High / Medium / Low
- `likely_judge_questions`: string[]
- `improvement_suggestions`: per weakness
- `narrative_feedback`: README + demo storytelling feedback

---

## Onchain Attestation Badge Fields

Stored per-wallet on Monad:

- `wallet`
- `timestamp`
- `report_hash` (keccak256 of full report JSON)
- `readiness_score`
- `preflight_version`
- `verified` (boolean)

---

## Behavior Rules for Claude

1. **Ask before assuming** — if a requirement is ambiguous (Gemmini model endpoint format, contract ABI shape, x402 payload spec), ask rather than guess.
2. **Use monskills for all Monad work** — do not write raw ethers.js or viem patterns for Monad interactions without first loading the monskills plugin.
3. **Run modules in parallel** — `/api/review` must fire modules 3.1–3.5 concurrently, not sequentially.
4. **No over-engineering** — ponytail is active. No abstractions without a concrete second use case. No config files for values that never change.
5. **Security boundaries** — validate all builder inputs at the API boundary. Private keys and API tokens never touch the frontend.
6. **One source of truth for scores** — readiness % is computed on the backend after Gemmini returns; never let the frontend calculate it.
7. **Re-run means re-run everything fresh** — no caching of module results between runs.

---

## What PreFlight Is NOT

- Not a GitHub linter
- Not a security scanner
- Not a CI/CD replacement
- Not the official judging system
- Not a guarantee of winning

---

## Demo Flow (Critical)

1. Fictional builder → paste inputs → run PreFlight
2. AI flags: weak docs, broken x402, missing blockchain justification
3. Builder applies AI-generated fixes
4. Re-run → score improves (e.g., 64 → 91)
5. x402 endpoint validated
6. Mint onchain "PreFlight Ready" badge on Monad
7. Closing line: **"Don't let the first AI judge your project be the one that decides your fate."**
