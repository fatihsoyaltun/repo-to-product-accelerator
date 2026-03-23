import fs from "node:fs";
import path from "node:path";
import { fingerprintRepo } from "./lib/fingerprint.js";

const repoUrl = process.argv[2];
const args = process.argv.slice(3);

let localPath: string | undefined;

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--local-path") {
    localPath = args[i + 1];
  }
}

if (!repoUrl) {
  console.error("Usage: pnpm repo-analyzer <repo-url> [--local-path <path>]");
  process.exit(1);
}

const fingerprint = fingerprintRepo(repoUrl, localPath);

const outputDir = path.resolve("data/repo-fingerprints");
fs.mkdirSync(outputDir, { recursive: true });

const safeName = fingerprint.repoName.replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.join(outputDir, `${safeName}.json`);

fs.writeFileSync(outputPath, JSON.stringify(fingerprint, null, 2), "utf-8");

console.log(`Fingerprint created: ${outputPath}`);
console.log(JSON.stringify(fingerprint, null, 2));
