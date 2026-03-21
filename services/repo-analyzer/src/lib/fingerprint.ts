import type { RepoFingerprint } from "@rpa/shared-types";

function inferFromRepoName(repoName: string) {
  const lower = repoName.toLowerCase();

  const detectedFrameworks = new Set<string>();
  const capabilities = new Set<string>();
  let maturityScore = 20;
  const notes: string[] = [];

  if (lower.includes("next")) {
    detectedFrameworks.add("Next.js");
    capabilities.add("web-app");
    capabilities.add("frontend-platform");
    maturityScore += 15;
    notes.push("repo name suggests Next.js ecosystem");
  }

  if (lower.includes("cli")) {
    capabilities.add("developer-tooling");
    capabilities.add("command-line-interface");
    maturityScore += 10;
    notes.push("repo name suggests CLI capability");
  }

  if (lower.includes("agent")) {
    capabilities.add("agent-orchestration");
    capabilities.add("automation");
    maturityScore += 10;
    notes.push("repo name suggests agent workflow capability");
  }

  if (lower.includes("monitor")) {
    capabilities.add("monitoring");
    capabilities.add("data-ingestion");
    maturityScore += 10;
    notes.push("repo name suggests monitoring/data collection");
  }

  if (lower.includes("post") || lower.includes("content")) {
    capabilities.add("content-operations");
    capabilities.add("publishing");
    maturityScore += 8;
    notes.push("repo name suggests content/publishing workflow");
  }

  return {
    detectedFrameworks: Array.from(detectedFrameworks),
    capabilities: Array.from(capabilities),
    maturityScore: Math.min(maturityScore, 100),
    notes
  };
}

export function fingerprintRepo(repoUrl: string): RepoFingerprint {
  const repoName = repoUrl.split("/").filter(Boolean).pop() ?? "unknown-repo";
  const inferred = inferFromRepoName(repoName);

  return {
    repoName,
    repoUrl,
    primaryLanguage: null,
    detectedFrameworks: inferred.detectedFrameworks,
    capabilities: inferred.capabilities,
    maturityScore: inferred.maturityScore,
    notes: [
      "initial heuristic fingerprint only",
      "README parsing and language detection not implemented yet",
      ...inferred.notes
    ]
  };
}
