# **PreFlight: Technical Requirements Document**

## **1\. Stack Overview**

* **Frontend:** React (single page app)  
* **Backend:** Node.js (Express)  
* **AI:** Gemmini API (fine-tuned model)  
* **Blockchain:** Monad (testnet primary, mainnet ready)  
* **Contract tooling:** Monskills  
* **Payments:** x402 protocol \+ native USDC on Monad  
* **External APIs:** GitHub API, HTTP Fetch

---

## **2\. System Architecture**

Three-layer architecture:

**Client (React)** → calls → **Backend (Node/Express)** → calls → **GitHub API / Live URL / Monad RPC / Gemmini API / x402 Endpoints**

All validation logic lives in the backend. Frontend is display and input only. Wallet connection handled client-side.

---

## **3\. Backend Modules**

### **3.1 Repo Scanner**

* Accepts a GitHub repo URL  
* Authenticates via GitHub API (personal access token in env)  
* Fetches commit history, checks first commit timestamp against hackathon start (Jul 13, 2025 13:00 UTC)  
* Checks for README existence at root  
* Flags single-commit repos or suspiciously bulk-imported commit patterns  
* Returns structured result: eligibility status, README present, commit count, first commit date, flags

### **3.2 Live App Checker**

* Accepts a project URL  
* Fetches page HTML via HTTP  
* Scans for known placeholder signals: lorem ipsum, "coming soon", "under construction", default React/Next boilerplate text, hardcoded mock data patterns  
* Returns: functional likelihood score, flags found, summary string for Gemmini context

### **3.3 Checklist Scorer**

* Accepts a JSON object of submission fields submitted by the builder via the UI form  
* Validates presence and non-emptiness of: project title, problem statement, solution description, GitHub URL, demo video URL, contract address, deployment URL, category (testnet/mainnet), social post URL  
* Returns: completion percentage, list of missing fields

### **3.4 Contract Verifier**

* Accepts a contract address and network (testnet/mainnet)  
* Queries Monad RPC endpoint for bytecode at address  
* Confirms contract is deployed (bytecode exists and is non-empty)  
* Returns: deployed boolean, network confirmed, address

### **3.5 x402 Tester**

* Accepts an endpoint URL from the builder  
* **Step 1 — Handshake:** GET request with no auth, confirm HTTP 402 response with valid JSON body containing scheme, price, network, facilitator address  
* **Step 2 — Payment retry:** Construct a minimal x402-compliant payment payload signed with a backend-controlled testnet wallet funded with testnet USDC (Circle faucet), attach as X-Payment header, retry request, confirm 200 response and resource served  
* **Step 3 — Facilitator check:** Confirm facilitator address in 402 body resolves to deployed contract on Monad  
* **Step 4 — Replay guard:** Reuse same payment payload, confirm server returns 402 or 400 (rejection), not 200  
* **Step 5 — Mismatch check:** Compare declared price/network in 402 body against onchain settlement record  
* Returns: per-step pass/fail, overall x402 health boolean, failure reasons

### **3.6 Gemmini Reasoning Engine**

* Aggregates outputs from all above modules into a single structured context payload  
* Sends to fine-tuned Gemmini API endpoint  
* Prompt instructs Gemmini to reason as a hackathon judge evaluating: problem clarity, originality, technical execution, blockchain justification, Monad integration quality, business value, documentation quality, presentation quality  
* Gemmini returns: overall score (0–100), per-category scores, judge confidence level, likely judge questions, improvement suggestions per weakness found, storytelling/narrative feedback on README and demo description  
* Backend passes Gemmini response to frontend as-is

### **3.7 Attestation Minter**

* Triggered only when readiness score exceeds threshold (suggest 80%)  
* Connects to Monad via Monskills  
* Mints onchain badge to builder's wallet address containing: wallet, timestamp, keccak256 hash of full report JSON, readiness score, PreFlight version string, verification boolean  
* Returns: transaction hash, badge token ID, Monad explorer link

---

## **4\. Frontend Modules**

### **4.1 Input Form**

* Fields: GitHub repo URL, live app URL, contract address, network toggle (testnet/mainnet), x402 endpoint URL (optional, shown when builder toggles "I built an x402 integration"), submission fields form (title, problem, solution, demo video URL, category, social post URL)  
* Wallet connect button (client-side, connects to Monad)  
* Single "Run PreFlight" CTA

### **4.2 Results Dashboard**

* Submission Readiness Score — large percentage display, central element  
* Per-category progress bars: Documentation, Technical Validation, Monad Integration, AI Evaluation, Presentation, Business Case  
* Gemmini Score breakdown panel: overall score, per-category scores, judge confidence badge, likely judge questions list  
* Module results accordion: each of the 5 backend modules shows pass/fail with Gemmini's explanation (not raw errors)  
* Improvement suggestions panel: Gemmini's actionable recommendations per issue  
* x402 panel (shown only if endpoint was provided): per-step result, overall health indicator  
* Mint badge CTA (enabled only when score ≥ 80%)

### **4.3 Badge Viewer**

* Post-mint: shows transaction hash, Monad explorer link, badge metadata (score, timestamp, report hash)  
* Shareable link/card for social (relevant to the viral prize track)

---

## **5\. Gemmini Integration**

* Fine-tuned on general good vs. bad project examples  
* Called once per review run, after all technical validators complete  
* Input context includes: repo scan result, live app check result, checklist result, contract verification result, x402 result (if run), raw README content (fetched from GitHub API), builder-submitted description fields  
* Output must include: overall score, category scores, confidence, questions, suggestions, narrative feedback  
* Instruct model to return JSON only — parse on backend, never expose raw API response to client  
* Re-run supported: builder can edit inputs and call again, backend re-runs all modules fresh

---

## **6\. Onchain Components**

### **6.1 Attestation Contract**

* Deployed on Monad testnet via Monskills  
* Stores per-wallet: report hash, score, timestamp, version, verified boolean  
* Mint function callable only from backend signer wallet  
* View function to look up attestation by wallet address or token ID

### **6.2 x402 Test Wallet**

* Backend-controlled wallet pre-funded with testnet USDC from Circle faucet  
* Used exclusively for x402 payment simulation calls  
* Testnet USDC contract: 0x534b2f3A21130d7a60830c2Df862319e593943A3  
* Mainnet USDC contract: 0x754704Bc059F8C67012fEd69BC8A327a5aafb603

---

## **7\. Environment Variables Required**

* GitHub API token  
* Gemmini API key \+ fine-tuned model endpoint  
* Monad RPC URL (testnet \+ mainnet)  
* Backend signer wallet private key (for attestation minting \+ x402 test wallet)  
* Attestation contract address (post-deploy)  
* x402 test wallet address

---

## **8\. API Routes (Backend)**

* POST /api/review — accepts all builder inputs, runs all modules, calls Gemmini, returns full report  
* POST /api/mint — accepts wallet address \+ report JSON, mints attestation, returns tx hash  
* GET /api/attestation/:wallet — looks up existing attestation for a wallet on Monad

---

## **9\. Data Flow**

Builder submits form  
→ POST /api/review  
→ Backend runs modules 3.1–3.5 in parallel  
→ Aggregates results  
→ Sends to Gemmini (3.6)  
→ Gemmini returns scored report  
→ Backend computes final readiness %  
→ Returns full report to frontend  
→ Frontend renders dashboard  
→ If score ≥ 80%, builder clicks Mint  
→ POST /api/mint  
→ Attestation contract called via Monskills  
→ Badge minted on Monad  
→ Frontend shows tx hash \+ shareable card

---

## **10\. Build Priority Order**

1. Checklist scorer \+ repo scan (core, no external dependencies)  
2. Contract verifier (simple RPC call)  
3. Live app checker (HTTP fetch \+ pattern matching)  
4. Gemmini integration (depends on fine-tuned model being ready)  
5. Attestation contract deployment via Monskills \+ mint flow  
6. x402 tester (needs test wallet funded \+ x402 endpoint to test against)  
7. Frontend dashboard \+ badge viewer  
8. Re-run flow \+ shareable card

