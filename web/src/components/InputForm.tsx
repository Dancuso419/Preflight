import { useEffect, useRef, useState } from "react";
import type { ReviewInputs, SubmissionFields } from "../types";

interface Props {
  onSubmit: (inputs: ReviewInputs) => void;
  loading?: boolean;
}

type F = {
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

const EMPTY: F = {
  repoUrl: "", liveUrl: "", contractAddress: "", network: "testnet",
  x402Endpoint: "", title: "", problemStatement: "", solution: "",
  demoVideoUrl: "", socialPostUrl: "",
};

function isUrl(s: string) { try { new URL(s); return true; } catch { return false; } }
function isAddr(s: string) { return /^0x[0-9a-fA-F]{40}$/.test(s); }

const STEPS = [
  { label: "Repository",  short: "Repo" },
  { label: "Deployment",  short: "Deploy" },
  { label: "Contract",    short: "Contract" },
  { label: "Project",     short: "Project" },
  { label: "Demo",        short: "Demo" },
];

export function InputForm({ onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<F>(EMPTY);
  const [step, setStep] = useState(0);           // 0–4
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [animating, setAnimating] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof F, boolean>>>({});
  const firstRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  function set(key: keyof F, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  function touch(key: keyof F) {
    setTouched((p) => ({ ...p, [key]: true }));
  }

  // Focus first field when step changes
  useEffect(() => {
    const t = setTimeout(() => firstRef.current?.focus(), 260);
    return () => clearTimeout(t);
  }, [step]);

  function go(next: number) {
    if (animating) return;
    setDir(next > step ? "fwd" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 240);
  }

  // Per-step validity
  const valid = [
    isUrl(form.repoUrl) && isUrl(form.liveUrl),
    isAddr(form.contractAddress),
    true, // x402 is optional
    form.title.trim().length > 0 && form.problemStatement.trim().length > 0,
    isUrl(form.demoVideoUrl),
  ] as const;

  function advance() {
    if (step < 4) go(step + 1);
    else handleSubmit();
  }

  function handleSubmit() {
    const submission: SubmissionFields = {
      title: form.title, problemStatement: form.problemStatement,
      solution: form.solution, githubUrl: form.repoUrl,
      demoVideoUrl: form.demoVideoUrl, contractAddress: form.contractAddress,
      deploymentUrl: form.liveUrl, category: form.network,
      socialPostUrl: form.socialPostUrl,
    };
    onSubmit({
      repoUrl: form.repoUrl, liveUrl: form.liveUrl,
      contractAddress: form.contractAddress, network: form.network,
      submission,
      ...(form.x402Endpoint ? { x402Endpoint: form.x402Endpoint } : {}),
    });
  }

  const isLast = step === 4;
  const canAdvance = valid[step as 0|1|2|3|4] && !animating;

  return (
    <div className="wiz-shell">

      {/* Progress bar */}
      <div className="wiz-progress">
        <div className="wiz-progress-bar" style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </div>

      {/* Step pills */}
      <div className="wiz-pills">
        {STEPS.map((s, i) => (
          <button
            key={s.short}
            type="button"
            className={`wiz-pill ${i === step ? "active" : i < step ? "done" : ""}`}
            onClick={() => i < step && go(i)}
            disabled={i > step}
          >
            <span className="wiz-pill-num">{i < step ? "✓" : i + 1}</span>
            <span className="wiz-pill-label">{s.short}</span>
          </button>
        ))}
      </div>

      {/* Sliding panel */}
      <div className="wiz-viewport">
        <div
          className={`wiz-slide ${animating ? (dir === "fwd" ? "exit-left" : "exit-right") : (dir === "fwd" ? "enter-fwd" : "enter-back")}`}
          key={step}
        >

          {/* ── Step 0: Repo + Live App ── */}
          {step === 0 && (
            <div className="wiz-panel">
              <div className="wiz-header">
                <span className="wiz-step-tag">Step 1 of 5</span>
                <h3>Where's your project?</h3>
                <p className="wiz-sub">Paste the GitHub repo and your deployed live app.</p>
              </div>
              <div className="wiz-fields">
                <div className="input-group">
                  <label className="input-label">GitHub Repository URL <span className="input-required">*</span></label>
                  <input
                    ref={firstRef as React.RefObject<HTMLInputElement>}
                    className={`input${touched.repoUrl && !isUrl(form.repoUrl) ? " input--error" : isUrl(form.repoUrl) ? " input--valid" : ""}`}
                    type="url" placeholder="https://github.com/you/project"
                    value={form.repoUrl}
                    onChange={(e) => set("repoUrl", e.target.value)}
                    onBlur={() => touch("repoUrl")}
                  />
                  {touched.repoUrl && !isUrl(form.repoUrl) && <span className="input-error">Valid GitHub URL required</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Live App URL <span className="input-required">*</span></label>
                  <input
                    className={`input${touched.liveUrl && !isUrl(form.liveUrl) ? " input--error" : isUrl(form.liveUrl) ? " input--valid" : ""}`}
                    type="url" placeholder="https://your-app.vercel.app"
                    value={form.liveUrl}
                    onChange={(e) => set("liveUrl", e.target.value)}
                    onBlur={() => touch("liveUrl")}
                    onKeyDown={(e) => e.key === "Enter" && canAdvance && advance()}
                  />
                  {touched.liveUrl && !isUrl(form.liveUrl) && <span className="input-error">Valid URL required</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Contract + Network ── */}
          {step === 1 && (
            <div className="wiz-panel">
              <div className="wiz-header">
                <span className="wiz-step-tag">Step 2 of 5</span>
                <h3>Your Monad contract</h3>
                <p className="wiz-sub">We'll verify bytecode is actually deployed onchain.</p>
              </div>
              <div className="wiz-fields">
                <div className="input-group">
                  <label className="input-label">Smart Contract Address <span className="input-required">*</span></label>
                  <input
                    ref={firstRef as React.RefObject<HTMLInputElement>}
                    className={`input input--mono${touched.contractAddress && !isAddr(form.contractAddress) ? " input--error" : isAddr(form.contractAddress) ? " input--valid" : ""}`}
                    type="text" placeholder="0x..."
                    value={form.contractAddress}
                    onChange={(e) => set("contractAddress", e.target.value)}
                    onBlur={() => touch("contractAddress")}
                    spellCheck={false}
                  />
                  {touched.contractAddress && !isAddr(form.contractAddress)
                    ? <span className="input-error">Must be a valid 0x address (42 chars)</span>
                    : <span className="input-hint">Your deployed contract on Monad testnet or mainnet.</span>
                  }
                </div>

                <div className="input-group">
                  <label className="input-label">Network <span className="input-required">*</span></label>
                  <div className="toggle-group">
                    <button type="button" className={`toggle-btn${form.network === "testnet" ? " active" : ""}`} onClick={() => set("network", "testnet")}>Testnet</button>
                    <button type="button" className={`toggle-btn${form.network === "mainnet" ? " active" : ""}`} onClick={() => set("network", "mainnet")}>Mainnet</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: x402 (optional) + Project Title ── */}
          {step === 2 && (
            <div className="wiz-panel">
              <div className="wiz-header">
                <span className="wiz-step-tag">Step 3 of 5</span>
                <h3>Payment + project name</h3>
                <p className="wiz-sub">x402 endpoint is optional — skip it if your project doesn't use it.</p>
              </div>
              <div className="wiz-fields">
                <div className="input-group">
                  <label className="input-label">x402 Endpoint <span className="input-optional">(optional)</span></label>
                  <input
                    ref={firstRef as React.RefObject<HTMLInputElement>}
                    className={`input${touched.x402Endpoint && form.x402Endpoint && !isUrl(form.x402Endpoint) ? " input--error" : form.x402Endpoint && isUrl(form.x402Endpoint) ? " input--valid" : ""}`}
                    type="url" placeholder="https://your-app.vercel.app/api/resource"
                    value={form.x402Endpoint}
                    onChange={(e) => set("x402Endpoint", e.target.value)}
                    onBlur={() => touch("x402Endpoint")}
                  />
                  {touched.x402Endpoint && form.x402Endpoint && !isUrl(form.x402Endpoint)
                    ? <span className="input-error">Must be a valid URL</span>
                    : <span className="input-hint">An endpoint that returns HTTP 402 — we run the full 5-step check.</span>
                  }
                </div>

                <div className="input-group">
                  <label className="input-label">Project Title <span className="input-required">*</span></label>
                  <input
                    className={`input${touched.title && !form.title.trim() ? " input--error" : form.title.trim() ? " input--valid" : ""}`}
                    type="text" placeholder="My Monad DeFi Protocol"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    onBlur={() => touch("title")}
                    maxLength={120}
                    onKeyDown={(e) => e.key === "Enter" && canAdvance && advance()}
                  />
                  {touched.title && !form.title.trim() && <span className="input-error">Required</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Problem + Solution ── */}
          {step === 3 && (
            <div className="wiz-panel">
              <div className="wiz-header">
                <span className="wiz-step-tag">Step 4 of 5</span>
                <h3>What problem are you solving?</h3>
                <p className="wiz-sub">The AI judge will use these to evaluate your project's reasoning.</p>
              </div>
              <div className="wiz-fields">
                <div className="input-group">
                  <label className="input-label">Problem Statement <span className="input-required">*</span></label>
                  <textarea
                    ref={firstRef as React.RefObject<HTMLTextAreaElement>}
                    className={`input input--textarea${touched.problemStatement && !form.problemStatement.trim() ? " input--error" : form.problemStatement.trim() ? " input--valid" : ""}`}
                    placeholder="What problem does your project solve?"
                    value={form.problemStatement}
                    onChange={(e) => set("problemStatement", e.target.value)}
                    onBlur={() => touch("problemStatement")}
                    rows={3}
                  />
                  {touched.problemStatement && !form.problemStatement.trim() && <span className="input-error">Required</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Your Solution <span className="input-required">*</span></label>
                  <textarea
                    className={`input input--textarea${touched.solution && !form.solution.trim() ? " input--error" : form.solution.trim() ? " input--valid" : ""}`}
                    placeholder="How does your project solve it?"
                    value={form.solution}
                    onChange={(e) => set("solution", e.target.value)}
                    onBlur={() => touch("solution")}
                    rows={3}
                  />
                  {touched.solution && !form.solution.trim() && <span className="input-error">Required</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Demo + Social ── */}
          {step === 4 && (
            <div className="wiz-panel">
              <div className="wiz-header">
                <span className="wiz-step-tag">Step 5 of 5</span>
                <h3>Show us your demo</h3>
                <p className="wiz-sub">Link your demo video. Social post is optional.</p>
              </div>
              <div className="wiz-fields">
                <div className="input-group">
                  <label className="input-label">Demo Video URL <span className="input-required">*</span></label>
                  <input
                    ref={firstRef as React.RefObject<HTMLInputElement>}
                    className={`input${touched.demoVideoUrl && !isUrl(form.demoVideoUrl) ? " input--error" : isUrl(form.demoVideoUrl) ? " input--valid" : ""}`}
                    type="url" placeholder="https://youtube.com/watch?v=..."
                    value={form.demoVideoUrl}
                    onChange={(e) => set("demoVideoUrl", e.target.value)}
                    onBlur={() => touch("demoVideoUrl")}
                  />
                  {touched.demoVideoUrl && !isUrl(form.demoVideoUrl) && <span className="input-error">Valid URL required</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Social Post URL <span className="input-optional">(optional)</span></label>
                  <input
                    className={`input${touched.socialPostUrl && form.socialPostUrl && !isUrl(form.socialPostUrl) ? " input--error" : form.socialPostUrl && isUrl(form.socialPostUrl) ? " input--valid" : ""}`}
                    type="url" placeholder="https://twitter.com/you/status/..."
                    value={form.socialPostUrl}
                    onChange={(e) => set("socialPostUrl", e.target.value)}
                    onBlur={() => touch("socialPostUrl")}
                    onKeyDown={(e) => e.key === "Enter" && canAdvance && advance()}
                  />
                  {touched.socialPostUrl && form.socialPostUrl && !isUrl(form.socialPostUrl) && <span className="input-error">Must be a valid URL</span>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer nav */}
      <div className="wiz-footer">
        {step > 0 ? (
          <button type="button" className="btn btn--ghost wiz-back" onClick={() => go(step - 1)}>
            ← Back
          </button>
        ) : <span />}

        <button
          type="button"
          className={`btn btn--accent wiz-next${canAdvance ? "" : " wiz-next--dim"}`}
          onClick={advance}
          disabled={!canAdvance || loading}
        >
          {loading ? "Running…" : isLast ? "▶ Run PreFlight" : "Continue →"}
        </button>
      </div>

    </div>
  );
}
