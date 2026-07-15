# PreFlight — Build Progress

## Legend
- ✅ Done — tested and committed
- 🔧 In progress
- ⬜ Not started

---

## Project Setup
| Task | Status | Notes |
|------|--------|-------|
| CLAUDE.md (guidelines) | ✅ | Skills, rules, env vars, demo flow |
| Project scaffold | ✅ | `contracts/`, `server/`, `web/` |
| Git initialized | ✅ | 3 commits on `master` |
| `.monskills` metadata | ✅ | `chain=monad-testnet` |
| Foundry installed | ✅ | v1.7.1 |
| OpenZeppelin installed | ✅ | via `forge install` |
| `tsx` (TS runner) | ✅ | replaces broken `ts-node` on Node 24 + TS 7 |

---

## Smart Contracts (`contracts/`)
| Task | Status | Notes |
|------|--------|-------|
| `PreFlightAttestation.sol` | ✅ | ERC721 + Ownable, mint threshold ≥80% enforced onchain |
| Foundry tests (3 tests) | ✅ | mint pass, mint block, access control — all pass |
| Deploy script (`Deploy.s.sol`) | ✅ | stub ready, needs `BACKEND_SIGNER_ADDRESS` env |
| Deploy to Monad testnet | ⬜ | needs monskills wallet + funded signer |
| Contract verification | ⬜ | after deploy, use monskills verification API |

---

## Backend Modules (`server/src/modules/`)
| Module | Status | Tests | Notes |
|--------|--------|-------|-------|
| `checklistScorer` | ✅ | 6 passing | validates 9 fields + category enum guard |
| `repoScanner` | ✅ | 8 passing | GitHub API, eligibility, README, bulk_import flag, DI fetcher |
| `liveAppChecker` | ✅ | 10 passing | placeholder pattern scan, DI fetcher, unreachable handled |
| `contractVerifier` | ✅ | 7 passing | eth_getCode via Monad RPC, DI fetcher, invalid addr throws, RPC failure safe |
| `x402Tester` | ✅ | 9 passing | 5-step flow, sequential DI requester, short-circuits on step 1 fail |
| `gemminiEngine` | ✅ | 8 passing | context aggregation, prompt builder, JSON parse (incl. markdown fence), readinessPct formula |
| `attestationMinter` | ⬜ | — | calls deployed contract via Monskills |

---

## API Routes (`server/src/routes/`)
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/review` | ⬜ stub | wired to parallel `Promise.all`, needs modules done |
| `POST /api/mint` | ⬜ stub | blocked on attestationMinter |
| `GET /api/attestation/:wallet` | ⬜ stub | blocked on contract deploy |

---

## Frontend (`web/src/`)
| Component | Status | Notes |
|-----------|--------|-------|
| Wagmi config (Monad testnet) | ✅ | chain id 10143 wired |
| `types/index.ts` | ✅ | `ReviewInputs`, `GemminiReport` shared types |
| `InputForm` | ⬜ stub | needs UI implementation (impeccable skill) |
| `ResultsDashboard` | ⬜ stub | readiness score, category bars, AI breakdown |
| `BadgeViewer` | ⬜ stub | tx hash, explorer link, shareable card |
| Wallet connect (Para) | ⬜ | monskills wallet-integration skill |

---

## Environment Variables
| Variable | Status |
|----------|--------|
| `GITHUB_API_TOKEN` | ⬜ fill in `.env` |
| `GEMMINI_API_KEY` | ⬜ fill in `.env` |
| `GEMMINI_MODEL_ENDPOINT` | ⬜ fill in `.env` |
| `MONAD_RPC_URL_TESTNET` | ⬜ fill in `.env` |
| `MONAD_RPC_URL_MAINNET` | ⬜ fill in `.env` |
| `BACKEND_SIGNER_PRIVATE_KEY` | ⬜ fill in `.env` |
| `ATTESTATION_CONTRACT_ADDRESS` | ⬜ set after deploy |
| `X402_TEST_WALLET_ADDRESS` | ⬜ fill in `.env` |

---

## Next Up (TRD build order)
1. Deploy contract → `attestationMinter`
6. Frontend UI (impeccable skill)
7. Wallet connect (Para / monskills wallet-integration)

---

_Last updated: 2026-07-15_
