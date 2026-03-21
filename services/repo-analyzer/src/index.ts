import fs from "node:fs";
import path from "node:path";
import { fingerprintRepo } from "./lib/fingerprint.js";

const repoUrl = process.argv[2];

if (!repoUrl) {
  console.error("Usage: pnpm repo-analyzer <repo-url>");
  process.exit(1);
}

const fingerprint = fingerprintRepo(repoUrl);

const outputDir = path.resolve("data/repo-fingerprints");
fs.mkdirSync(outputDir, { recursive: true });

const safeName = fingerprint.repoName.replace(/[^a-zA-Z0-9-_]/g, "_");
const outputPath = path.join(outputDir, `${safeName}.json`);

fs.writeFileSync(outputPath, JSON.stringify(fingerprint, null, 2), "utf-8");

console.log(`Fingerprint created: ${outputPath}`);
console.log(JSON.stringify(fingerprint, null, 2));
