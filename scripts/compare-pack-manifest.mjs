#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const BASELINE_PATH = path.resolve(process.cwd(), "data", "pack-manifest.json");
const DEFAULT_MAX_TOTAL_GROWTH_BYTES = 250_000;
const DEFAULT_MAX_FILE_GROWTH_BYTES = 100_000;
function getCurrentPackFiles() {
  const raw = execSync("npm pack --dry-run --json", { encoding: "utf8", shell: true });
  const parsed = JSON.parse(raw);
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!entry || !Array.isArray(entry.files)) {
    throw new Error("Could not parse npm pack --dry-run output.");
  }
  return entry.files.map((f) => ({ path: String(f.path || ""), size: Number(f.size || 0) }));
}

function formatBytes(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} MB`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} KB`;
  return `${value} B`;
}

function main() {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  if (!existsSync(packageJsonPath)) {
    console.log("No package.json found. Skipping manifest comparison.");
    return;
  }
  if (!existsSync(BASELINE_PATH)) {
    console.log("No baseline manifest found. Skipping comparison.");
    return;
  }

  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  const baselineFiles = Array.isArray(baseline.files) ? baseline.files : [];
  const currentFiles = getCurrentPackFiles();

  const baselineMap = new Map(baselineFiles.map((f) => [f.path, Number(f.size || 0)]));
  const currentMap = new Map(currentFiles.map((f) => [f.path, Number(f.size || 0)]));

  const added = currentFiles.filter((f) => !baselineMap.has(f.path));
  const removed = baselineFiles.filter((f) => !currentMap.has(f.path));
  const grown = currentFiles
    .filter((f) => baselineMap.has(f.path))
    .map((f) => ({
      path: f.path,
      before: baselineMap.get(f.path),
      after: f.size,
      delta: f.size - baselineMap.get(f.path)
    }))
    .filter((f) => f.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  const baselineTotal = baselineFiles.reduce((sum, f) => sum + Number(f.size || 0), 0);
  const currentTotal = currentFiles.reduce((sum, f) => sum + Number(f.size || 0), 0);
  const totalDelta = currentTotal - baselineTotal;

  const maxTotalGrowthBytes = DEFAULT_MAX_TOTAL_GROWTH_BYTES;
  const maxFileGrowthBytes = DEFAULT_MAX_FILE_GROWTH_BYTES;
  const failures = [];

  if (totalDelta > maxTotalGrowthBytes) {
    failures.push(
      `Total tarball growth ${formatBytes(totalDelta)} exceeds limit ${formatBytes(maxTotalGrowthBytes)}`
    );
  }

  const largeGrowth = grown.filter((f) => f.delta > maxFileGrowthBytes);
  if (largeGrowth.length > 0) {
    failures.push(
      `Found ${largeGrowth.length} files with growth over ${formatBytes(maxFileGrowthBytes)}`
    );
  }

  console.log("Pack manifest comparison:");
  console.log(`- Added files: ${added.length}`);
  console.log(`- Removed files: ${removed.length}`);
  console.log(`- Total size delta: ${formatBytes(totalDelta)}`);

  if (added.length > 0) {
    console.log("\nNew files:");
    for (const item of added.slice(0, 20)) {
      console.log(`- ${item.path} (${formatBytes(item.size)})`);
    }
  }

  if (largeGrowth.length > 0) {
    console.log("\nLargest file growth:");
    for (const item of largeGrowth.slice(0, 20)) {
      console.log(`- ${item.path}: +${formatBytes(item.delta)} (${formatBytes(item.after)} total)`);
    }
  }

  if (failures.length > 0) {
    console.error("\nManifest comparison failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nManifest comparison passed.");
}

main();
