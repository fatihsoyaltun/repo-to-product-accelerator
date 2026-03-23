import fs from "node:fs";
import path from "node:path";

type Idea = {
  title: string;
  problem: string;
  targetUser: string;
  score: number;
  rationale: string[];
};

function generateIdeas(capabilities: string[]): Idea[] {
  const ideas: Idea[] = [];

  if (capabilities.includes("web-app")) {
    ideas.push({
      title: "AI-powered Website Generator",
      problem: "Users struggle to quickly build production-ready web apps",
      targetUser: "solo builders",
      score: 72,
      rationale: [
        "matches web-app capability",
        "broad market but competitive space"
      ]
    });
  }

  if (capabilities.includes("frontend-platform")) {
    ideas.push({
      title: "Frontend Boilerplate Accelerator",
      problem: "Developers waste time setting up frontend stacks",
      targetUser: "frontend developers",
      score: 81,
      rationale: [
        "strong fit with frontend-platform capability",
        "narrower and more implementable MVP"
      ]
    });
  }

  if (capabilities.includes("content-operations")) {
    ideas.push({
      title: "Content Automation Platform",
      problem: "Teams struggle to manage and publish content consistently",
      targetUser: "marketing teams",
      score: 68,
      rationale: [
        "fits content/publishing signals",
        "would need more workflow assumptions"
      ]
    });
  }

  if (
    capabilities.includes("developer-tooling") &&
    capabilities.includes("command-line-interface")
  ) {
    ideas.push({
      title: "Developer Workflow CLI",
      problem: "Developers lose time chaining repetitive repository and tooling workflows manually",
      targetUser: "developers",
      score: 78,
      rationale: [
        "strong fit with developer-tooling capability",
        "CLI distribution makes MVP practical"
      ]
    });
  }

  if (
    capabilities.includes("agent-orchestration") &&
    capabilities.includes("automation")
  ) {
    ideas.push({
      title: "Agent Task Composer",
      problem: "Teams struggle to coordinate repeatable agent tasks safely across engineering workflows",
      targetUser: "tech leads",
      score: 76,
      rationale: [
        "fits agent-orchestration and automation signals",
        "good internal tooling angle"
      ]
    });
  }

  if (
    capabilities.includes("dashboard") &&
    capabilities.includes("visualization")
  ) {
    ideas.push({
      title: "Internal Analysis Console",
      problem: "Teams lack a compact interface to inspect generated engineering insights and outputs",
      targetUser: "internal product teams",
      score: 64,
      rationale: [
        "matches dashboard and visualization signals",
        "useful later, but weaker than CLI-first MVP"
      ]
    });
  }

  if (
    capabilities.includes("developer-tooling") &&
    capabilities.includes("agent-orchestration")
  ) {
    ideas.push({
      title: "Repo-to-Product Accelerator",
      problem: "Builders waste time turning promising repositories into concrete product directions, architectures, and execution plans",
      targetUser: "solo builders",
      score: 89,
      rationale: [
        "direct match for developer-tooling plus agent-orchestration",
        "strong alignment with current monorepo purpose"
      ]
    });
  }

  if (ideas.length === 0) {
    ideas.push({
      title: "Generic Dev Tooling Product",
      problem: "No clear mapping found from repo capabilities",
      targetUser: "developers",
      score: 30,
      rationale: [
        "fallback idea only",
        "weak repo-to-product mapping"
      ]
    });
  }

  return ideas.sort((a, b) => b.score - a.score);
}

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: pnpm idea-engine <fingerprint-file>");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const fingerprint = JSON.parse(raw);

const ideas = generateIdeas(fingerprint.capabilities);

const outputDir = path.resolve("data/idea-templates");
fs.mkdirSync(outputDir, { recursive: true });

const safeName = String(fingerprint.repoName).replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.join(outputDir, `${safeName}.ideas.json`);

fs.writeFileSync(outputPath, JSON.stringify(ideas, null, 2), "utf-8");

console.log(`Ideas created: ${outputPath}`);
console.log(JSON.stringify(ideas, null, 2));
