#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUTPUT_PATH = path.resolve(process.cwd(), "data", "pack-manifest.json");
function getPackFiles() {
  const raw = execSync("npm pack --dry-run --json", { encoding: "utf8", shell: true });
  const parsed = JSON.parse(raw);
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!entry || !Array.isArray(entry.files)) {
    throw new Error("Could not parse npm pack --dry-run output.");
  }
  return entry.files
    .map((f) => ({ path: String(f.path || ""), size: Number(f.size || 0) }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function main() {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  if (!existsSync(packageJsonPath)) {
    console.log("No package.json found. Skipping manifest generation.");
    return;
  }

  const files = getPackFiles();
  const dir = path.dirname(OUTPUT_PATH);
  mkdirSync(dir, { recursive: true });

  const output = {
    generatedAt: new Date().toISOString(),
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.size, 0),
    files
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Saved baseline manifest to ${OUTPUT_PATH}`);
}

main();
