import fs from "node:fs";
import path from "node:path";

type Architecture = {
  productTitle: string;
  recommendedApps: string[];
  recommendedServices: string[];
};

type ScaffoldPlan = {
  productTitle: string;
  targetDirectories: string[];
  targetFiles: string[];
  notes: string[];
};

const REPO_ROOT = process.cwd();

function buildScaffoldPlan(architecture: Architecture): ScaffoldPlan {
  const targetFiles = architecture.recommendedServices.flatMap((servicePath) => [
    `${servicePath}/package.json`,
    `${servicePath}/src/index.ts`
  ]);

  return {
    productTitle: architecture.productTitle,
    targetDirectories: [...architecture.recommendedApps],
    targetFiles,
    notes: ["preview only, no files generated"]
  };
}

function normalizeRepoPath(filePath: string): string {
  return path.posix.normalize(filePath.replace(/\\/g, "/"));
}

function isAllowedTargetFile(targetFile: string): boolean {
  const normalizedPath = normalizeRepoPath(targetFile);

  if (
    path.posix.isAbsolute(normalizedPath) ||
    normalizedPath === ".." ||
    normalizedPath.startsWith("../")
  ) {
    return false;
  }

  const parts = normalizedPath.split("/");

  return (
    (parts.length === 3 &&
      parts[0] === "services" &&
      parts[1].length > 0 &&
      parts[2] === "package.json") ||
    (parts.length === 4 &&
      parts[0] === "services" &&
      parts[1].length > 0 &&
      parts[2] === "src" &&
      parts[3] === "index.ts")
  );
}

function getServiceName(targetFile: string): string {
  return normalizeRepoPath(targetFile).split("/")[1];
}

function buildPlaceholderContent(targetFile: string): string {
  const normalizedPath = normalizeRepoPath(targetFile);
  const serviceName = getServiceName(normalizedPath);

  if (normalizedPath.endsWith("/package.json")) {
    return `${JSON.stringify(
      {
        name: `@rpa/${serviceName}`,
        version: "0.1.0",
        private: true,
        type: "module",
        main: "src/index.ts"
      },
      null,
      2
    )}\n`;
  }

  return `console.log("${serviceName} initialized");\n`;
}

function applyScaffoldPlan(scaffoldPlan: ScaffoldPlan): void {
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];

  for (const targetFile of scaffoldPlan.targetFiles) {
    if (!isAllowedTargetFile(targetFile)) {
      throw new Error(`Refusing to generate unsupported target file: ${targetFile}`);
    }

    const normalizedPath = normalizeRepoPath(targetFile);
    const absolutePath = path.resolve(REPO_ROOT, normalizedPath);

    if (fs.existsSync(absolutePath)) {
      skippedFiles.push(normalizedPath);
      continue;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, buildPlaceholderContent(normalizedPath), "utf-8");
    createdFiles.push(normalizedPath);
  }

  console.log("Apply mode enabled.");
  console.log("Created files:");

  if (createdFiles.length === 0) {
    console.log("- none");
  } else {
    for (const createdFile of createdFiles) {
      console.log(`- ${createdFile}`);
    }
  }

  console.log("Skipped existing files:");

  if (skippedFiles.length === 0) {
    console.log("- none");
  } else {
    for (const skippedFile of skippedFiles) {
      console.log(`- ${skippedFile}`);
    }
  }
}

const filePath = process.argv[2];
const shouldApply = process.argv.includes("--apply");

if (!filePath) {
  console.error("Usage: pnpm exec tsx services/scaffolder/src/index.ts <architecture-file> [--apply]");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const architecture: Architecture = JSON.parse(raw);
const scaffoldPlan = buildScaffoldPlan(architecture);

const outputDir = path.resolve("data/scaffold-plans");
fs.mkdirSync(outputDir, { recursive: true });

const safeName = architecture.productTitle.replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.join(outputDir, `${safeName}.scaffold-plan.json`);

fs.writeFileSync(outputPath, JSON.stringify(scaffoldPlan, null, 2), "utf-8");

console.log(`Scaffold plan created: ${outputPath}`);
console.log(JSON.stringify(scaffoldPlan, null, 2));

if (shouldApply) {
  applyScaffoldPlan(scaffoldPlan);
}
