import fs from "node:fs";
import path from "node:path";

type Idea = {
  title: string;
  problem: string;
  targetUser: string;
  score: number;
};

type ArchitectureSpec = {
  productTitle: string;
  systemType: string;
  targetUser: string;
  coreModules: string[];
  recommendedApps: string[];
  recommendedServices: string[];
  dataObjects: string[];
  deliveryNotes: string[];
  capabilitySnapshot: string[];
};

function generateArchitecture(idea: Idea): ArchitectureSpec {
  if (idea.title === "Repo-to-Product Accelerator") {
    return {
      productTitle: idea.title,
      systemType: "developer-tooling platform",
      targetUser: idea.targetUser,
      coreModules: [
        "repo ingestion",
        "repo fingerprinting",
        "capability tagging",
        "idea mapping",
        "architecture generation",
        "backlog generation",
        "scaffold planning"
      ],
      recommendedApps: [
        "apps/cli",
        "apps/dashboard"
      ],
      recommendedServices: [
        "services/repo-analyzer",
        "services/idea-engine",
        "services/architecture-engine",
        "services/task-breakdown",
        "services/scaffolder"
      ],
      dataObjects: [
        "RepoFingerprint",
        "Idea",
        "ArchitectureSpec",
        "Backlog",
        "ScaffoldPlan"
      ],
      deliveryNotes: [
        "CLI-first execution",
        "dashboard optional for MVP",
        "scaffold must remain template-based",
        "agent orchestration layer can be added later"
      ],
      capabilitySnapshot: [
        "developer-tooling",
        "agent-orchestration"
      ]
    };
  }

  if (idea.title === "Developer Workflow CLI") {
    return {
      productTitle: idea.title,
      systemType: "developer-tooling cli",
      targetUser: idea.targetUser,
      coreModules: [
        "repo analysis",
        "workflow orchestration",
        "command generation",
        "pipeline execution"
      ],
      recommendedApps: [
        "apps/cli"
      ],
      recommendedServices: [
        "services/repo-analyzer",
        "services/idea-engine",
        "services/architecture-engine",
        "services/task-breakdown"
      ],
      dataObjects: [
        "RepoFingerprint",
        "Idea",
        "ArchitectureSpec",
        "Backlog"
      ],
      deliveryNotes: [
        "CLI-only MVP",
        "fast execution over UI breadth"
      ],
      capabilitySnapshot: [
        "developer-tooling",
        "command-line-interface"
      ]
    };
  }

  if (idea.title === "Agent Task Composer") {
    return {
      productTitle: idea.title,
      systemType: "agent workflow tooling",
      targetUser: idea.targetUser,
      coreModules: [
        "task templates",
        "agent chaining",
        "execution control"
      ],
      recommendedApps: [
        "apps/cli"
      ],
      recommendedServices: [
        "services/idea-engine",
        "services/architecture-engine",
        "services/task-breakdown"
      ],
      dataObjects: [
        "Idea",
        "ArchitectureSpec",
        "Backlog"
      ],
      deliveryNotes: [
        "internal-tool-first MVP"
      ],
      capabilitySnapshot: [
        "agent-orchestration",
        "automation"
      ]
    };
  }

  if (idea.title === "Internal Analysis Console") {
    return {
      productTitle: idea.title,
      systemType: "internal dashboard tool",
      targetUser: idea.targetUser,
      coreModules: [
        "analysis display",
        "artifact inspection",
        "result browsing"
      ],
      recommendedApps: [
        "apps/dashboard"
      ],
      recommendedServices: [
        "services/idea-engine",
        "services/architecture-engine"
      ],
      dataObjects: [
        "Idea",
        "ArchitectureSpec"
      ],
      deliveryNotes: [
        "dashboard-first exploration tool"
      ],
      capabilitySnapshot: [
        "dashboard",
        "visualization"
      ]
    };
  }

  return {
    productTitle: idea.title,
    systemType: "generic product system",
    targetUser: idea.targetUser,
    coreModules: [
      "repo import",
      "idea mapping"
    ],
    recommendedApps: [
      "apps/cli"
    ],
    recommendedServices: [
      "services/repo-analyzer",
      "services/idea-engine"
    ],
    dataObjects: [
      "RepoFingerprint",
      "Idea"
    ],
    deliveryNotes: [
      "fallback architecture only"
    ],
    capabilitySnapshot: []
  };
}

const filePath = process.argv[2];
const ideaIndexArg = process.argv[3];

if (!filePath) {
  console.error("Usage: pnpm architecture-engine <ideas-file> [idea-index]");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const ideas: Idea[] = JSON.parse(raw);

const selectedIndex = ideaIndexArg ? Number(ideaIndexArg) : 0;

if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || !ideas[selectedIndex]) {
  console.error(`Invalid idea index: ${ideaIndexArg ?? 0}`);
  process.exit(1);
}

const selectedIdea = ideas[selectedIndex];
const architecture = generateArchitecture(selectedIdea);

const outputDir = path.resolve("data/architectures");
fs.mkdirSync(outputDir, { recursive: true });

const safeName = selectedIdea.title.replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.join(outputDir, `${safeName}.architecture.json`);

fs.writeFileSync(outputPath, JSON.stringify(architecture, null, 2), "utf-8");

console.log(`Architecture created: ${outputPath}`);
console.log(JSON.stringify(architecture, null, 2));
