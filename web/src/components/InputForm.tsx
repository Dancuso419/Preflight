import { useState } from "react";
import type { ReviewInputs, SubmissionFields } from "../types";

interface Props {
  onSubmit: (inputs: ReviewInputs) => void;
  loading: boolean;
}

type FormState = {
  repoUrl: string;
  liveUrl: string;
  contractAddress: string;
  network: "testnet" | "mainnet";
  x402Endpoint: string;
  title: string;
  problemStatement: string;
  solution: string;
  demoVideoUrl: string;
  socialPostUrl: string;
};

const EMPTY: FormState = {
  repoUrl: "",
  liveUrl: "",
  contractAddress: "",
  network: "testnet",
  x402Endpoint: "",
  title: "",
  problemStatement: "",
  solution: "",
  demoVideoUrl: "",
  socialPostUrl: "",
};

export function InputForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const submission: SubmissionFields = {
      title: form.title,
      problemStatement: form.problemStatement,
      solution: form.solution,
      githubUrl: form.repoUrl,
      demoVideoUrl: form.demoVideoUrl,
      contractAddress: form.contractAddress,
      deploymentUrl: form.liveUrl,
      category: form.network,
      socialPostUrl: form.socialPostUrl,
    };

    const inputs: ReviewInputs = {
      repoUrl: form.repoUrl,
      liveUrl: form.liveUrl,
      contractAddress: form.contractAddress,
      network: form.network,
      submission,
      ...(form.x402Endpoint ? { x402Endpoint: form.x402Endpoint } : {}),
    };

    onSubmit(inputs);
  }

  return (
    <form onSubmit={handleSubmit} className="card card--lg form-card">

      {/* ── Section 1: Tech Links ── */}
      <div>
        <div className="form-section-title">
          <span className="form-section-num">1</span>
          Technical Endpoints
        </div>
        <div className="form-fields">
          <div className="input-group">
            <label className="input-label">
              GitHub Repository URL <span className="input-required">*</span>
            </label>
            <input
              className="input"
              type="url"
              placeholder="https://github.com/yourname/project"
              value={form.repoUrl}
              onChange={(e) => set("repoUrl", e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="input-group">
              <label className="input-label">
                Live App URL <span className="input-required">*</span>
              </label>
              <input
                className="input"
                type="url"
                placeholder="https://your-app.vercel.app"
                value={form.liveUrl}
                onChange={(e) => set("liveUrl", e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Network <span className="input-required">*</span>
              </label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn${form.network === "testnet" ? " active" : ""}`}
                  onClick={() => set("network", "testnet")}
                >
                  Testnet
                </button>
                <button
                  type="button"
                  className={`toggle-btn${form.network === "mainnet" ? " active" : ""}`}
                  onClick={() => set("network", "mainnet")}
                >
                  Mainnet
                </button>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              Smart Contract Address <span className="input-required">*</span>
            </label>
            <input
              className="input"
              type="text"
              placeholder="0x..."
              value={form.contractAddress}
              onChange={(e) => set("contractAddress", e.target.value)}
              required
            />
            <span className="input-hint">Your deployed Monad contract — we'll verify bytecode onchain.</span>
          </div>

          <div className="input-group">
            <label className="input-label">
              x402 Endpoint <span style={{ fontWeight: 400, color: "var(--ink-3)" }}>(optional)</span>
            </label>
            <input
              className="input"
              type="url"
              placeholder="https://your-app.vercel.app/api/resource"
              value={form.x402Endpoint}
              onChange={(e) => set("x402Endpoint", e.target.value)}
            />
            <span className="input-hint">An endpoint that returns HTTP 402. We'll run the full 5-step payment flow check.</span>
          </div>
        </div>
      </div>

      <hr className="form-divider" />

      {/* ── Section 2: Submission Details ── */}
      <div>
        <div className="form-section-title">
          <span className="form-section-num">2</span>
          Submission Details
        </div>
        <div className="form-fields">
          <div className="input-group">
            <label className="input-label">
              Project Title <span className="input-required">*</span>
            </label>
            <input
              className="input"
              type="text"
              placeholder="My Monad DeFi Protocol"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="form-row-2">
            <div className="input-group">
              <label className="input-label">
                Problem Statement <span className="input-required">*</span>
              </label>
              <textarea
                className="input"
                placeholder="What problem does your project solve?"
                value={form.problemStatement}
                onChange={(e) => set("problemStatement", e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Solution <span className="input-required">*</span>
              </label>
              <textarea
                className="input"
                placeholder="How does your project solve it?"
                value={form.solution}
                onChange={(e) => set("solution", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="input-group">
              <label className="input-label">
                Demo Video URL <span className="input-required">*</span>
              </label>
              <input
                className="input"
                type="url"
                placeholder="https://youtube.com/..."
                value={form.demoVideoUrl}
                onChange={(e) => set("demoVideoUrl", e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Social Post URL <span className="input-required">*</span>
              </label>
              <input
                className="input"
                type="url"
                placeholder="https://twitter.com/..."
                value={form.socialPostUrl}
                onChange={(e) => set("socialPostUrl", e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="form-divider" />

      {/* ── Submit ── */}
      <div className="form-footer">
        <button
          type="submit"
          className="btn btn--primary btn--lg btn--full"
          disabled={loading}
        >
          {loading ? "Running..." : "▶ Run PreFlight"}
        </button>
        <p className="input-hint" style={{ textAlign: "center" }}>
          Takes ~15 seconds · Checks repo, live app, contract, x402 + AI analysis in parallel
        </p>
      </div>
    </form>
  );
}
