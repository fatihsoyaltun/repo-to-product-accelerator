import fs from "node:fs";
import path from "node:path";

type Idea = {
  title: string;
  problem: string;
  targetUser: string;
  score: number;
  rationale: string[];
};

type Architecture = {
  productTitle: string;
  systemType: string;
  targetUser: string;
  coreModules: string[];
  recommendedApps: string[];
  recommendedServices: string[];
  dataObjects: string[];
  deliveryNotes: string[];
};

function buildArchitecture(selectedIdea: Idea): Architecture {
  if (selectedIdea.title === "Frontend Boilerplate Accelerator") {
    return {
      productTitle: selectedIdea.title,
      systemType: "developer-tooling platform",
      targetUser: selectedIdea.targetUser,
      coreModules: [
        "repo import",
        "repo fingerprinting",
        "capability tagging",
        "template recommendation",
        "starter scaffold generation"
      ],
      recommendedApps: [
        "apps/cli",
        "apps/dashboard"
      ],
      recommendedServices: [
        "services/repo-analyzer",
        "services/idea-engine",
        "services/architecture-engine",
        "services/scaffolder"
      ],
      dataObjects: [
        "RepoFingerprint",
        "Idea",
        "ArchitectureSpec",
        "ScaffoldPlan"
      ],
      deliveryNotes: [
        "start with CLI-first workflow",
        "dashboard should be read-only in MVP if needed",
        "scaffold generation must stay narrow and template-based"
      ]
    };
  }

  return {
    productTitle: selectedIdea.title,
    systemType: "generic product system",
    targetUser: selectedIdea.targetUser,
    coreModules: ["repo import", "idea mapping"],
    recommendedApps: ["apps/cli"],
    recommendedServices: ["services/repo-analyzer", "services/idea-engine"],
    dataObjects: ["RepoFingerprint", "Idea"],
    deliveryNotes: ["fallback architecture only"]
  };
}

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: pnpm architecture-engine <ideas-file>");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const ideas: Idea[] = JSON.parse(raw);

const selectedIdea = ideas[0];
const architecture = buildArchitecture(selectedIdea);

const safeName = selectedIdea.title.replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.resolve("data/architectures", `${safeName}.architecture.json`);

fs.writeFileSync(outputPath, JSON.stringify(architecture, null, 2), "utf-8");

console.log(`Architecture created: ${outputPath}`);
console.log(JSON.stringify(architecture, null, 2));
