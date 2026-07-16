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
| Agent wallet | ✅ | `0x386525226239a33b71ECA15A13F7Ed08508B02B3` (monskills keystore) |

---

## Smart Contracts (`contracts/`)
| Task | Status | Notes |
|------|--------|-------|
| `PreFlightAttestation.sol` | ✅ | ERC721 + Ownable, mint threshold ≥80% enforced onchain |
| Foundry tests (10 tests) | ✅ | All security cases pass — soulbound, CEI, token IDs from 1 |
| Deploy script (`Deploy.s.sol`) | ✅ | reads `BACKEND_SIGNER_ADDRESS` env var |
| Deploy to Monad testnet | ✅ | `0x659A05Bab409E6Ccb76a715c9167d8A0344A4897` (chain 10143) |
| Contract verification | ⬜ | optional: use monskills verification API |

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
| `attestationMinter` | ✅ | 7 passing | viem writeContract, keccak256 report hash, score guard, DI caller |

---

## API Routes (`server/src/routes/`)
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/review` | 🔧 stub | needs real module wiring |
| `POST /api/mint` | 🔧 stub | needs attestationMinter wiring |
| `GET /api/attestation/:wallet` | 🔧 stub | needs contract read wiring |

---

## Frontend (`web/src/`)
| Component | Status | Notes |
|-----------|--------|-------|
| Wagmi config (Monad testnet) | ✅ | chain id 10143 wired |
| `types/index.ts` | ✅ | `ReviewInputs`, `GemminiReport` shared types |
| `InputForm` | ⬜ | needs UI implementation (impeccable skill) |
| `ResultsDashboard` | ⬜ | readiness score, category bars, AI breakdown |
| `BadgeViewer` | ⬜ | tx hash, explorer link, shareable card |
| Wallet connect (Para) | ⬜ | monskills wallet-integration skill |

---

## Environment Variables
| Variable | Status |
|----------|--------|
| `GITHUB_API_TOKEN` | ⬜ fill in `server/.env` |
| `GEMMINI_API_KEY` | ⬜ fill in `server/.env` |
| `GEMMINI_MODEL_ENDPOINT` | ⬜ fill in `server/.env` |
| `MONAD_RPC_URL_TESTNET` | ✅ `https://testnet-rpc.monad.xyz` |
| `MONAD_RPC_URL_MAINNET` | ✅ `https://rpc.monad.xyz` |
| `BACKEND_SIGNER_PRIVATE_KEY` | ✅ set (agent wallet) |
| `ATTESTATION_CONTRACT_ADDRESS` | ✅ `0x659A05Bab409E6Ccb76a715c9167d8A0344A4897` |
| `X402_TEST_WALLET_ADDRESS` | ⬜ fill in `server/.env` |

---

## Next Up
1. Wire API routes (`POST /api/review`, `POST /api/mint`, `GET /api/attestation/:wallet`)
2. Frontend UI (impeccable skill)
3. Wallet connect (Para / monskills wallet-integration)
4. Fill in `GITHUB_API_TOKEN`, `GEMMINI_API_KEY`, `GEMMINI_MODEL_ENDPOINT`, `X402_TEST_WALLET_ADDRESS`

---

_Last updated: 2026-07-16_
