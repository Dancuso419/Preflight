export interface SubmissionFields {
  title: string;
  problemStatement: string;
  solution: string;
  githubUrl: string;
  demoVideoUrl: string;
  contractAddress: string;
  deploymentUrl: string;
  category: "testnet" | "mainnet";
  socialPostUrl: string;
}

export interface ReviewInputs {
  repoUrl: string;
  liveUrl: string;
  contractAddress: string;
  network: "testnet" | "mainnet";
  x402Endpoint?: string;
  submission: SubmissionFields;
}

export interface GemminiReport {
  overallScore: number;
  categoryScores: {
    innovation: number;
    technicalExecution: number;
    monadIntegration: number;
    businessPotential: number;
  };
  judgeConfidence: "High" | "Medium" | "Low";
  likelyJudgeQuestions: string[];
  improvementSuggestions: string[];
  narrativeFeedback: string;
  readinessPct: number;
}
