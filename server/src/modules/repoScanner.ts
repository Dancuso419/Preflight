import axios from "axios";

const HACKATHON_START = new Date("2025-07-13T13:00:00Z");

export interface RepoScanResult {
  eligible: boolean;
  readmePresent: boolean;
  commitCount: number;
  firstCommitDate: string | null;
  flags: string[];
}

interface CommitItem {
  commit: { committer: { date: string } };
}

export type GithubFetcher = (url: string) => Promise<unknown>;

function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!m) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: m[1]!, repo: m[2]! };
}

const defaultFetcher: GithubFetcher = async (url) => {
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  return res.data;
};

export async function scanRepo(repoUrl: string, fetcher: GithubFetcher = defaultFetcher): Promise<RepoScanResult> {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const [commits, readmePresent] = await Promise.all([
    fetcher(`${base}/commits?per_page=100`) as Promise<CommitItem[]>,
    fetcher(`${base}/contents/README.md`).then(() => true).catch(() => false),
  ]);

  const firstCommit = commits[commits.length - 1];
  const firstCommitDate = firstCommit?.commit?.committer?.date ?? null;
  const eligible = firstCommitDate ? new Date(firstCommitDate) >= HACKATHON_START : false;

  const flags: string[] = [];
  if (commits.length === 1) flags.push("single_commit");

  // ponytail: bulk import = 10+ commits spanning less than 1 hour
  if (commits.length >= 10) {
    const newest = new Date(commits[0]!.commit.committer.date).getTime();
    const oldest = new Date(firstCommitDate!).getTime();
    if (newest - oldest < 3_600_000) flags.push("bulk_import");
  }

  return { eligible, readmePresent: readmePresent as boolean, commitCount: commits.length, firstCommitDate, flags };
}
