import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Idea = {
  title: string;
  score: number;
};

function toSafeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, "_");
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function runCommand(command: string, cwd: string): void {
  execSync(command, {
    cwd,
    stdio: "inherit"
  });
}

const repoUrl = process.argv[2];

if (!repoUrl) {
  console.error("Usage: pnpm exec tsx apps/cli/src/index.ts <repo-url>");
  process.exit(1);
}

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const repoRoot = path.resolve(currentDir, "../../..");

const repoName = repoUrl.split("/").filter(Boolean).pop() ?? "unknown-repo";
const repoSafeName = toSafeName(repoName);

const fingerprintPath = path.join(repoRoot, "data/repo-fingerprints", `${repoSafeName}.json`);
const ideasPath = path.join(repoRoot, "data/idea-templates", `${repoSafeName}.ideas.json`);

runCommand(
  `pnpm exec tsx services/repo-analyzer/src/index.ts ${quote(repoUrl)}`,
  repoRoot
);

runCommand(
  `pnpm exec tsx services/idea-engine/src/index.ts ${quote(fingerprintPath)}`,
  repoRoot
);

const ideas: Idea[] = JSON.parse(fs.readFileSync(ideasPath, "utf-8"));
const selectedIdea = ideas[0];

if (!selectedIdea) {
  console.error("Idea engine did not produce any ideas.");
  process.exit(1);
}

console.log(`Selected idea: ${selectedIdea.title} (${selectedIdea.score})`);

const architectureSafeName = toSafeName(selectedIdea.title);
const architecturePath = path.join(
  repoRoot,
  "data/architectures",
  `${architectureSafeName}.architecture.json`
);
const backlogPath = path.join(
  repoRoot,
  "data/backlogs",
  `${architectureSafeName}.backlog.json`
);
const scaffoldPlanPath = path.join(
  repoRoot,
  "data/scaffold-plans",
  `${architectureSafeName}.scaffold-plan.json`
);

runCommand(
  `pnpm exec tsx services/architecture-engine/src/index.ts ${quote(ideasPath)}`,
  repoRoot
);

runCommand(
  `pnpm exec tsx services/task-breakdown/src/index.ts ${quote(architecturePath)}`,
  repoRoot
);

runCommand(
  `pnpm exec tsx services/scaffolder/src/index.ts ${quote(architecturePath)}`,
  repoRoot
);

console.log("Pipeline completed.");
console.log(`Fingerprint: ${fingerprintPath}`);
console.log(`Ideas: ${ideasPath}`);
console.log(`Architecture: ${architecturePath}`);
console.log(`Backlog: ${backlogPath}`);
console.log(`Scaffold plan: ${scaffoldPlanPath}`);
