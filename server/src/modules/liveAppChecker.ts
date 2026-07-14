// TRD 3.2 — Live App Checker
export interface LiveAppResult {
  functionalScore: number;
  flags: string[];
  summary: string;
}

export async function checkLiveApp(url: string): Promise<LiveAppResult> {
  // TODO: fetch HTML, scan for placeholder patterns
  throw new Error("Not implemented");
}
