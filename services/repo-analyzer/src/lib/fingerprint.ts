import type { RepoFingerprint } from "@rpa/shared-types";
import { readLocalReadme } from "./readme.js";
import { extractKeywordSignals } from "./readme-keywords.js";

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
    detectedFrameworks,
    capabilities,
    maturityScore,
    notes
  };
}

function enrichFromReadme(repoPath: string | undefined) {
  const detectedFrameworks = new Set<string>();
  const capabilities = new Set<string>();
  let maturityScore = 0;
  const notes: string[] = [];

  if (!repoPath) {
    return { detectedFrameworks, capabilities, maturityScore, notes };
  }

  const readme = readLocalReadme(repoPath);

  if (!readme) {
    notes.push("no local README detected");
    return { detectedFrameworks, capabilities, maturityScore, notes };
  }

  const signals = extractKeywordSignals(readme);

  if (signals.includes("Next.js")) {
    detectedFrameworks.add("Next.js");
    capabilities.add("web-app");
    capabilities.add("frontend-platform");
    maturityScore += 10;
  }

  if (signals.includes("React")) {
    detectedFrameworks.add("React");
    capabilities.add("frontend-ui");
    maturityScore += 5;
  }

  if (signals.includes("TypeScript")) {
    detectedFrameworks.add("TypeScript");
    maturityScore += 5;
  }

  if (signals.includes("CLI")) {
    capabilities.add("developer-tooling");
    capabilities.add("command-line-interface");
    maturityScore += 5;
  }

  if (signals.includes("Agent")) {
    capabilities.add("agent-orchestration");
    capabilities.add("automation");
    maturityScore += 5;
  }

  if (signals.includes("dashboard")) {
    capabilities.add("dashboard");
    capabilities.add("visualization");
    maturityScore += 5;
  }

  if (signals.includes("API")) {
    capabilities.add("api-platform");
    maturityScore += 5;
  }

  notes.push("local README signals applied");

  return { detectedFrameworks, capabilities, maturityScore, notes };
}

export function fingerprintRepo(repoUrl: string, repoPath?: string): RepoFingerprint {
  const repoName = repoUrl.split("/").filter(Boolean).pop() ?? "unknown-repo";

  const inferred = inferFromRepoName(repoName);
  const readmeEnrichment = enrichFromReadme(repoPath);

  const detectedFrameworks = new Set<string>([
    ...inferred.detectedFrameworks,
    ...readmeEnrichment.detectedFrameworks
  ]);

  const capabilities = new Set<string>([
    ...inferred.capabilities,
    ...readmeEnrichment.capabilities
  ]);

  return {
    repoName,
    repoUrl,
    primaryLanguage: null,
    detectedFrameworks: Array.from(detectedFrameworks),
    capabilities: Array.from(capabilities),
    maturityScore: Math.min(
      inferred.maturityScore + readmeEnrichment.maturityScore,
      100
    ),
    notes: [
      "initial heuristic fingerprint only",
      "README parsing uses local file only",
      ...inferred.notes,
      ...readmeEnrichment.notes
    ]
  };
}
