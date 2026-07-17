# PreFlight — AI Pre-Submission Review for Monad Builders

> **"Don't let the first AI judge your project be the one that decides your fate."**

PreFlight is an AI-powered hackathon review platform that simulates judge evaluation before you submit. Run your project through 5 technical validators, get an AI readiness score, fix the gaps, and mint an onchain attestation badge on Monad when you hit 80%.

**Live:** https://preflight-web.onrender.com

---

## What It Does

Builders paste their project details and PreFlight runs in parallel:

| Validator | What It Checks |
|---|---|
| **Repo Scanner** | GitHub commit history, README presence, hackathon eligibility window |
| **Live App Checker** | HTTP fetch of deployment URL, functional score |
| **Contract Verifier** | Bytecode presence on Monad testnet/mainnet RPC |
| **x402 Tester** | Full 5-step payment flow: handshake → payment → facilitator → replay guard → mismatch check |
| **AI Judge (Gemini)** | Aggregates all results, scores innovation / technical execution / Monad integration / business potential, generates judge questions and improvement suggestions |

After running, builders see:
- Readiness % score (0–100)
- Category breakdown
- Likely judge questions
- Specific improvement suggestions
- AI narrative feedback
- A shareable score card to post on X

If score ≥ 80%, builders can mint a **"PreFlight Ready"** soulbound attestation badge on Monad testnet — proof they ran the gauntlet before the real judges did.

---

## Monad Integration

- **Smart contract deployed on Monad testnet:** `0x659A05Bab409E6Ccb76a715c9167d8A0344A4897`
- Attestation badge minted per wallet address (soulbound NFT)
- Contract verifier checks bytecode on Monad RPC for any submitted contract address
- Wallet connect via RainbowKit configured for Monad testnet (Chain ID 10143)
- Badge fields stored onchain: `wallet`, `timestamp`, `report_hash` (keccak256), `readiness_score`, `preflight_version`

> **Note on x402:** PreFlight includes a 5-step x402 payment flow *tester* — it validates that a builder's own endpoint correctly implements the x402 protocol (handshake, payment, facilitator check, replay guard, mismatch detection). PreFlight itself is a free review tool and does not charge per review.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, RainbowKit, Wagmi |
| Backend | Node.js + Express + TypeScript |
| AI | Gemini Flash (via Google AI Studio) |
| Blockchain | Monad testnet via Viem |
| Smart Contracts | Solidity + Foundry |
| Deployment | Render (backend API + static frontend) |

---

## Architecture

```
Browser (React)
    │
    ▼
POST /api/review
    │
    ├── repoScanner      (GitHub API)
    ├── liveAppChecker   (HTTP fetch)
    ├── contractVerifier (Monad RPC)
    ├── x402Tester       (5-step flow)
    └── checklistScorer  (sync)
         │
         ▼
    Gemini AI judge
         │
         ▼
    GemminiReport → client

POST /api/mint
    │
    └── attestationMinter → Monad testnet contract → txHash + tokenId
```

All 5 validators fire in parallel via `Promise.all`. Individual failures degrade gracefully — one broken module never kills the whole review.

---

## Running Locally

**Prerequisites:** Node 18+, Foundry (for contract work)

```bash
# Clone
git clone https://github.com/Dancuso419/Preflight
cd Preflight

# Backend
cd server
cp .env.example .env   # fill in your keys
npm install
npm run dev

# Frontend (new terminal)
cd web
npm install
npm run dev
```

**Required env vars (server/.env):**

```
GITHUB_API_TOKEN=
GEMMINI_API_KEY=
MONAD_RPC_URL_TESTNET=https://testnet-rpc.monad.xyz
BACKEND_SIGNER_PRIVATE_KEY=
ATTESTATION_CONTRACT_ADDRESS=0x659A05Bab409E6Ccb76a715c9167d8A0344A4897
```

---

## Smart Contract

Located in `contracts/src/PreFlightAttestation.sol`. Deployed and verified on Monad testnet.

```bash
# Deploy
cd contracts
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL_TESTNET --broadcast
```

---

## Demo Flow

1. Paste your GitHub repo URL + project details
2. PreFlight runs all 5 validators + AI judge (~30 seconds)
3. See your readiness score, judge questions, and improvement suggestions
4. Apply the fixes, click **Run Again** — form pre-fills with your last submission
5. Watch your score improve
6. Hit 80%+ → mint your **PreFlight Ready** badge on Monad
7. Share your score card on X

---

## Hackathon Submission

- **Contract:** `0x659A05Bab409E6Ccb76a715c9167d8A0344A4897` (Monad testnet)
- **Live app:** https://preflight-web.onrender.com
- **Backend API:** https://preflight-r494.onrender.com
