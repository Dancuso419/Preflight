import axios from "axios";

export interface LiveAppResult {
  functionalScore: number;
  flags: string[];
  summary: string;
}

export type HtmlFetcher = (url: string) => Promise<string>;

// Each entry: [flag_name, pattern_to_match_case_insensitively]
const PLACEHOLDER_PATTERNS: [string, RegExp][] = [
  ["lorem_ipsum",       /lorem\s+ipsum/i],
  ["coming_soon",       /coming\s+soon/i],
  ["under_construction",/under\s+construction/i],
  ["react_boilerplate", /edit\s+src\/App\.(tsx?|jsx?)\s+and\s+save/i],
  ["nextjs_boilerplate",/get\s+started\s+by\s+editing/i],
];

const defaultFetcher: HtmlFetcher = async (url) => {
  const res = await axios.get<string>(url, { timeout: 10_000, responseType: "text" });
  return res.data;
};

export async function checkLiveApp(url: string, fetcher: HtmlFetcher = defaultFetcher): Promise<LiveAppResult> {
  let html: string;
  try {
    html = await fetcher(url);
  } catch {
    return { functionalScore: 0, flags: ["unreachable"], summary: "App could not be reached." };
  }

  const flags = PLACEHOLDER_PATTERNS
    .filter(([, pattern]) => pattern.test(html))
    .map(([name]) => name);

  const functionalScore = Math.max(0, 100 - flags.length * 20);
  const summary = flags.length === 0
    ? "App appears functional — no placeholder indicators found."
    : `Found ${flags.length} placeholder indicator(s): ${flags.join(", ")}.`;

  return { functionalScore, flags, summary };
}
