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
