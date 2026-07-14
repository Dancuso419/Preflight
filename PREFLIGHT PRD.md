# **PreFlight — Product Requirements Document** 

## **1\. Product Overview**

**Product Name:** PreFlight

**Tagline:**  
**Meet your AI co-judge before the real judge does.**

**One-liner:**  
PreFlight is an AI-powered pre-submission review platform that simulates how an AI hackathon judge evaluates your project, identifies weaknesses, recommends improvements, validates x402 payment flows, and proves your application works through an on-chain Monad attestation.

# **2\. The Problem**

Modern hackathons increasingly rely on AI-assisted judging and structured evaluation criteria. Yet builders often submit projects without knowing how their work will actually be evaluated.

Many lose valuable points because of issues they never notice:

* Weak README documentation  
* Poor project descriptions  
* Broken demo links  
* Missing submission fields  
* Invalid contract addresses  
* Static or incomplete applications  
* Non-functional x402 payment flows  
* Weak explanation of why blockchain is necessary  
* Missing business justification  
* Poor demo storytelling

These mistakes are rarely caused by bad engineering—they're caused by a lack of feedback before submission.

Today, builders have no way to experience the judging process before pressing **Submit**.

# **3\. Vision**

Instead of asking:

**"Is my project finished?"**

PreFlight answers:

**"Would this project actually impress an AI judge?"**

PreFlight acts as an intelligent AI co-judge that reviews projects using reasoning—not just rule checking—and provides actionable recommendations before submission.

# **4\. Goals**

PreFlight enables builders to:

* Simulate an AI judging process before submission  
* Detect technical and documentation issues automatically  
* Receive AI-generated recommendations to improve their score  
* Validate x402 payment implementations end-to-end  
* Verify Monad smart contracts  
* Generate proof that the project successfully passed review through an onchain attestation

# **5\. Non Goals**

PreFlight is NOT:

* a GitHub linter  
* a security scanner  
* a CI/CD replacement  
* the official judging system  
* a guarantee that a project will win

Instead, it is an intelligent preparation tool.

# **6\. Target Users**

Primary users:

Hackathon participants building AI, Web3, or x402 applications.

Secondary users:

* mentors  
* hackathon organizers  
* university innovation programs

# **7\. Core Product Flow**

Builder pastes:

• GitHub Repository  
• Live URL  
• Contract Address  
• x402 Endpoint

↓

PreFlight begins AI Review

↓

Technical Validation

↓

AI Reasoning

↓

Judge Simulation

↓

Improvement Suggestions

↓

Re-run Review

↓

Onchain Attestation

# **8\. Core Features**

## **8.1 AI Judge Simulation ⭐**

This is the flagship feature.

Gemmini evaluates the project similarly to how an AI judge would.

Rather than checking boxes, it reasons about:

* clarity of problem  
* originality  
* technical implementation  
* blockchain justification  
* Monad integration  
* business value  
* documentation quality  
* overall presentation

Output:

Overall Score

89 / 100

Innovation  
9.1

Technical Execution  
8.8

Monad Integration  
9.5

Business Potential  
7.4

Judge Confidence

High

Likely Judge Questions

• Why Monad?

• Why blockchain?

• What makes this different?

• How does this scale?

## **8.2 AI Improvement Coach**

Instead of only identifying problems, PreFlight explains why they matter and recommends improvements.

Examples:

Instead of

❌ README missing architecture

PreFlight says

Your architecture is difficult to understand.

Consider adding a system diagram showing the interaction between the frontend, Monad contracts, x402 endpoint, and AI evaluation engine.

Instead of

❌ Weak project description

PreFlight rewrites it into a stronger version.

## **8.3 Repository Intelligence**

Repository analysis includes:

* commit history  
* hackathon eligibility  
* suspicious repository imports  
* README completeness  
* project structure  
* documentation quality

Gemmini summarizes the repository instead of merely reporting pass/fail.

## **8.4 Live Application Validation**

Rather than checking whether a URL loads, PreFlight evaluates whether the application appears functional.

It looks for indicators such as:

* placeholder interfaces  
* boilerplate text  
* broken navigation  
* incomplete workflows  
* missing user interactions

Gemmini explains why the application appears unfinished.

## **8.5 Submission Completeness Checker**

Automatically validates required submission fields.

Checks include:

* project title  
* problem statement  
* solution  
* GitHub repository  
* demo video  
* contract address  
* deployment URL  
* category  
* social post

Missing items are highlighted before submission.

## **8.6 Monad Contract Verification**

Verifies:

* contract deployment  
* network correctness  
* contract existence  
* accessibility

Reports deployment status immediately.

## **8.7 x402 Payment Validation ⭐**

PreFlight performs an end-to-end simulation of x402 payment flows.

Checks include:

* HTTP 402 handshake  
* payment retry  
* facilitator verification  
* replay protection  
* payment settlement  
* network mismatch  
* incorrect pricing

This provides confidence that agentic payment integrations work before judging.

## **8.8 AI Storytelling Review (NEW)**

Many technically strong projects lose because the presentation is weak.

Gemma evaluates:

* README clarity  
* opening hook  
* explanation flow  
* business narrative  
* problem framing

Suggestions include:

Your demo spends 90 seconds explaining setup before showing value.

or

Judges may not understand why blockchain is required.

## **8.9 Submission Readiness Score**

Instead of dozens of checkmarks, builders receive a single readiness score.

Example

Submission Readiness

93%

Documentation

██████████

Technical Validation

█████████░

Monad Integration

██████████

AI Evaluation

████████░░

Presentation

███████░░

Business Case

████████░░

This becomes the project's central dashboard.

## **8.10 On-chain Proof of Readiness**

Once all critical checks pass:

PreFlight mints an onchain Monad badge containing:

* wallet  
* timestamp  
* report hash  
* readiness score  
* version  
* verification status

The badge proves the project successfully completed PreFlight evaluation.

# **9\. Technical Architecture**

Frontend

* React

Backend

* Node.js

AI

* Gemmini

APIs

* GitHub API  
* HTTP Fetch

Blockchain

* Monad  
* Monskills

Payments

* x402  
* Native USDC

# **10\. User Journey**

Builder opens PreFlight

↓

Connect Wallet

↓

Paste Repository

↓

Paste Live URL

↓

Paste Contract

↓

Paste x402 Endpoint

↓

Gemma Reviews Project

↓

Technical Validators Execute

↓

AI Judge Generates Score

↓

Builder Applies Suggestions

↓

Re-run Evaluation

↓

Receive 95% Readiness

↓

Mint Monad Verification Badge

# **11\. Success Metrics**

A successful submission should demonstrate:

✅ AI-generated judging report

✅ Technical validation

✅ Monad smart contract verification

✅ Successful x402 payment simulation

✅ Actionable improvement suggestions

✅ Onchain readiness attestation

# **12\. Demo Flow (Critical for Winning)**

1. Introduce a fictional builder about to submit a project.  
2. Run PreFlight.  
3. The AI flags weak documentation, a broken x402 flow, and missing blockchain justification.  
4. Apply one or two AI-generated fixes.  
5. Re-run the review and watch the score improve from, for example, **64 → 91**.  
6. Successfully validate the x402 endpoint.  
7. Mint the onchain "PreFlight Ready" badge on Monad.  
8. End with the message:

**"Don't let the first AI judge your project be the one that decides your fate."**

