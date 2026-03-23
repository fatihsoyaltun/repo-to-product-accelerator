import fs from "node:fs";
import path from "node:path";

type Architecture = {
  productTitle: string;
  recommendedApps: string[];
  recommendedServices: string[];
  capabilitySnapshot?: string[];
};

type ScaffoldPlan = {
  productTitle: string;
  targetDirectories: string[];
  targetFiles: string[];
  notes: string[];
};

type TemplateRegistryEntry = {
  templateId: string;
  appliesTo: string[];
  capabilities?: string[];
  priority: number;
};

type TemplateManifest = {
  templateId: string;
  appliesTo: string | string[];
  targetType: "app" | "service";
  targetPath: string;
  files: string[];
};

const REPO_ROOT = process.cwd();
const TEMPLATE_REGISTRY_PATH = "templates/registry.json";
const TEMPLATE_MANIFEST_FILE_NAME = "template.json";

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

function isSafeRelativePath(filePath: string): boolean {
  const normalizedPath = normalizeRepoPath(filePath);

  return (
    !path.posix.isAbsolute(normalizedPath) &&
    normalizedPath !== ".." &&
    !normalizedPath.startsWith("../")
  );
}

function isAllowedTargetFile(targetFile: string): boolean {
  const normalizedPath = normalizeRepoPath(targetFile);

  if (!isSafeRelativePath(normalizedPath)) {
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

function loadTemplateManifest(templateManifestPath: string): TemplateManifest {
  const rawTemplateManifest = JSON.parse(
    fs.readFileSync(path.resolve(REPO_ROOT, templateManifestPath), "utf-8")
  ) as Record<string, unknown>;
  const templateId =
    typeof rawTemplateManifest.templateId === "string"
      ? rawTemplateManifest.templateId
      : path.basename(path.dirname(templateManifestPath));

  if (!isValidTemplateManifest(rawTemplateManifest)) {
    throw new Error(`Invalid template manifest: ${templateId}`);
  }

  return rawTemplateManifest;
}

function loadTemplateRegistry(): TemplateRegistryEntry[] {
  return JSON.parse(
    fs.readFileSync(path.resolve(REPO_ROOT, TEMPLATE_REGISTRY_PATH), "utf-8")
  ) as TemplateRegistryEntry[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidTemplateManifest(value: unknown): value is TemplateManifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Record<string, unknown>;

  return (
    typeof manifest.templateId === "string" &&
    (typeof manifest.appliesTo === "string" || isStringArray(manifest.appliesTo)) &&
    (manifest.targetType === "app" || manifest.targetType === "service") &&
    typeof manifest.targetPath === "string" &&
    isStringArray(manifest.files)
  );
}

function templateAppliesToProduct(
  appliesTo: string | string[],
  productTitle: string
): boolean {
  return Array.isArray(appliesTo) ? appliesTo.includes(productTitle) : appliesTo === productTitle;
}

function getCapabilityOverlapCount(
  templateCapabilities: string[] | undefined,
  architectureCapabilities: Set<string>
): number {
  if (!templateCapabilities || architectureCapabilities.size === 0) {
    return 0;
  }

  return [...new Set(templateCapabilities)].filter((capability) =>
    architectureCapabilities.has(capability)
  ).length;
}

function selectTemplateManifestPath(architecture: Architecture): string | null {
  const architectureCapabilities = new Set(architecture.capabilitySnapshot ?? []);
  const matchingTemplates = loadTemplateRegistry()
    .filter((template) => template.appliesTo.includes(architecture.productTitle))
    .map((template) => ({
      template,
      score:
        template.priority +
        getCapabilityOverlapCount(template.capabilities, architectureCapabilities) * 10
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.template.templateId.localeCompare(right.template.templateId)
    );

  if (matchingTemplates.length === 0) {
    return null;
  }

  const templateManifestPath = normalizeRepoPath(
    path.posix.join(
      "templates",
      matchingTemplates[0].template.templateId,
      TEMPLATE_MANIFEST_FILE_NAME
    )
  );

  if (!isSafeRelativePath(templateManifestPath)) {
    throw new Error(`Refusing to use unsupported template manifest path: ${templateManifestPath}`);
  }

  return templateManifestPath;
}

function applyTemplateScaffold(
  architecture: Architecture,
  createdFiles: string[],
  skippedFiles: string[]
): void {
  const templateManifestPath = selectTemplateManifestPath(architecture);

  if (!templateManifestPath) {
    return;
  }

  const templateManifest = loadTemplateManifest(templateManifestPath);

  if (!templateAppliesToProduct(templateManifest.appliesTo, architecture.productTitle)) {
    return;
  }

  if (!isSafeRelativePath(templateManifest.targetPath)) {
    throw new Error(`Refusing to use unsupported template target path: ${templateManifest.targetPath}`);
  }

  const normalizedTargetPath = normalizeRepoPath(templateManifest.targetPath);
  const templateDir = path.dirname(path.resolve(REPO_ROOT, templateManifestPath));
  const absoluteTargetDir = path.resolve(REPO_ROOT, normalizedTargetPath);

  fs.mkdirSync(absoluteTargetDir, { recursive: true });

  for (const templateFile of templateManifest.files) {
    if (!isSafeRelativePath(templateFile)) {
      throw new Error(`Refusing to use unsupported template file path: ${templateFile}`);
    }

    const normalizedTemplateFile = normalizeRepoPath(templateFile);
    const sourcePath = path.resolve(templateDir, normalizedTemplateFile);
    const targetPath = path.resolve(absoluteTargetDir, normalizedTemplateFile);
    const relativeTargetPath = normalizeRepoPath(
      path.posix.join(normalizedTargetPath, normalizedTemplateFile)
    );

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Template source file not found: ${relativeTargetPath}`);
    }

    if (fs.existsSync(targetPath)) {
      skippedFiles.push(relativeTargetPath);
      continue;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    createdFiles.push(relativeTargetPath);
  }
}

function applyScaffoldPlan(scaffoldPlan: ScaffoldPlan, architecture: Architecture): void {
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

  applyTemplateScaffold(architecture, createdFiles, skippedFiles);

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
  applyScaffoldPlan(scaffoldPlan, architecture);
}
