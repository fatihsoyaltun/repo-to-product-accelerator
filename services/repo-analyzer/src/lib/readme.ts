import fs from "node:fs";
import path from "node:path";

export function readLocalReadme(repoPath: string): string | null {
  const candidates = [
    "README.md",
    "readme.md",
    "README.MD"
  ];

  for (const fileName of candidates) {
    const fullPath = path.join(repoPath, fileName);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  }

  return null;
}
