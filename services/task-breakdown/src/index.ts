import fs from "node:fs";
import path from "node:path";

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

type BacklogItem = {
  id: string;
  title: string;
  type: "epic" | "task";
  area: string;
  priority: "high" | "medium" | "low";
};

function buildBacklog(architecture: Architecture): BacklogItem[] {
  const items: BacklogItem[] = [
    {
      id: "EPIC-1",
      title: "Repo ingestion pipeline",
      type: "epic",
      area: "repo-analyzer",
      priority: "high"
    },
    {
      id: "TASK-1",
      title: "Accept repo URL input from CLI",
      type: "task",
      area: "repo-analyzer",
      priority: "high"
    },
    {
      id: "TASK-2",
      title: "Persist fingerprint JSON output",
      type: "task",
      area: "repo-analyzer",
      priority: "high"
    },
    {
      id: "EPIC-2",
      title: "Idea generation flow",
      type: "epic",
      area: "idea-engine",
      priority: "high"
    },
    {
      id: "TASK-3",
      title: "Map capabilities to product ideas",
      type: "task",
      area: "idea-engine",
      priority: "high"
    },
    {
      id: "TASK-4",
      title: "Score and sort generated ideas",
      type: "task",
      area: "idea-engine",
      priority: "medium"
    },
    {
      id: "EPIC-3",
      title: "Architecture recommendation flow",
      type: "epic",
      area: "architecture-engine",
      priority: "high"
    },
    {
      id: "TASK-5",
      title: "Generate architecture spec from selected idea",
      type: "task",
      area: "architecture-engine",
      priority: "high"
    },
    {
      id: "EPIC-4",
      title: "Scaffold planning and generation",
      type: "epic",
      area: "scaffolder",
      priority: "high"
    },
    {
      id: "TASK-6",
      title: "Create scaffold plan from architecture spec",
      type: "task",
      area: "scaffolder",
      priority: "high"
    },
    {
      id: "TASK-7",
      title: "Generate starter files for selected template",
      type: "task",
      area: "scaffolder",
      priority: "medium"
    },
    {
      id: "EPIC-5",
      title: "CLI workflow integration",
      type: "epic",
      area: "apps/cli",
      priority: "medium"
    },
    {
      id: "TASK-8",
      title: "Create end-to-end CLI command flow",
      type: "task",
      area: "apps/cli",
      priority: "medium"
    }
  ];

  return items;
}

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: pnpm task-breakdown <architecture-file>");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const architecture: Architecture = JSON.parse(raw);

const backlog = buildBacklog(architecture);

const safeName = architecture.productTitle.replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.resolve("data/backlogs", `${safeName}.backlog.json`);

fs.writeFileSync(outputPath, JSON.stringify(backlog, null, 2), "utf-8");

console.log(`Backlog created: ${outputPath}`);
console.log(JSON.stringify(backlog, null, 2));
