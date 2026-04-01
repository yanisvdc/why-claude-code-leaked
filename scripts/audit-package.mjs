#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_MAX_BYTES = 500_000;
const DEFAULT_BLOCKED_EXTENSIONS = [".map"];
const DEFAULT_HIGH_RISK_PATTERNS = [
  "\\.pem$",
  "\\.key$",
  "\\.p12$",
  "\\.jks$",
  "(^|/)\\.env(\\.|$)",
  "(^|/)id_rsa(\\.|$)",
  "(^|/)secrets?/"
];
const DEFAULT_CONFIG_PATH = "package-audit.config.json";

function parseArgs(argv) {
  const args = {
    maxBytes: DEFAULT_MAX_BYTES,
    failOnLicenseMissing: false,
    blockExts: [...DEFAULT_BLOCKED_EXTENSIONS],
    configPath: DEFAULT_CONFIG_PATH
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--max-bytes=")) {
      const value = Number(arg.slice("--max-bytes=".length));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --max-bytes value: ${arg}`);
      }
      args.maxBytes = value;
      continue;
    }
    if (arg === "--fail-on-license-missing") {
      args.failOnLicenseMissing = true;
      continue;
    }
    if (arg.startsWith("--block-ext=")) {
      const ext = arg.slice("--block-ext=".length).trim();
      if (!ext.startsWith(".")) {
        throw new Error(`Blocked extension must start with '.': ${ext}`);
      }
      args.blockExts.push(ext.toLowerCase());
      continue;
    }
    if (arg.startsWith("--config=")) {
      args.configPath = arg.slice("--config=".length).trim();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  args.blockExts = Array.from(new Set(args.blockExts));
  return args;
}

function getPackagePackFiles() {
  const raw = execSync("npm pack --dry-run --json", {
    encoding: "utf8",
    shell: true
  });

  const parsed = JSON.parse(raw);
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!entry || !Array.isArray(entry.files)) {
    throw new Error("Could not parse npm pack --dry-run output.");
  }
  return entry.files.map((f) => ({
    path: String(f.path || ""),
    size: Number(f.size || 0)
  }));
}

function readPackageJson() {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  if (!existsSync(packageJsonPath)) {
    return null;
  }
  return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}

function readAuditConfig(configPath) {
  const absolutePath = path.resolve(process.cwd(), configPath);
  if (!existsSync(absolutePath)) {
    return null;
  }
  const config = JSON.parse(readFileSync(absolutePath, "utf8"));
  return config && typeof config === "object" ? config : null;
}

function compileRegexList(regexStrings, label) {
  if (!Array.isArray(regexStrings)) return [];
  return regexStrings.map((source) => {
    if (typeof source !== "string") {
      throw new Error(`Invalid ${label} regex: must be a string.`);
    }
    return new RegExp(source, "i");
  });
}

function formatBytes(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} MB`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} KB`;
  return `${value} B`;
}

function main() {
  const args = parseArgs(process.argv);
  const pkg = readPackageJson();
  if (!pkg) {
    console.log("No package.json found in current directory. Skipping package audit.");
    return;
  }
  const config = readAuditConfig(args.configPath);
  const configBlockedExts = Array.isArray(config?.blockedExtensions)
    ? config.blockedExtensions.filter((v) => typeof v === "string")
    : [];
  const mergedBlockedExts = Array.from(
    new Set(
      [...args.blockExts, ...configBlockedExts]
        .map((ext) => ext.trim().toLowerCase())
        .filter((ext) => ext.startsWith("."))
    )
  );
  const maxBytes = Number.isFinite(config?.maxBytes) ? Number(config.maxBytes) : args.maxBytes;
  const highRiskRegex = compileRegexList(
    config?.highRiskPatterns ?? DEFAULT_HIGH_RISK_PATTERNS,
    "highRiskPatterns"
  );
  const failOnMissingFilesAllowlist =
    config?.failOnMissingFilesAllowlist === true || false;

  const files = getPackagePackFiles();

  const blockedByExtension = [];
  const oversized = [];
  const highRisk = [];

  for (const file of files) {
    const lower = file.path.toLowerCase();
    if (mergedBlockedExts.some((ext) => lower.endsWith(ext))) {
      blockedByExtension.push(file);
    }
    if (file.size > maxBytes) {
      oversized.push(file);
    }
    if (highRiskRegex.some((rx) => rx.test(file.path))) {
      highRisk.push(file);
    }
  }

  const warnings = [];
  if (!pkg?.files) {
    const message =
      "No package allowlist found (`files` in package.json). Prefer allowlisting publish artifacts.";
    if (failOnMissingFilesAllowlist) {
      throw new Error(message);
    }
    warnings.push(message);
  }
  if (!pkg?.license) {
    const message = "No `license` field found in package.json.";
    if (args.failOnLicenseMissing) {
      throw new Error(message);
    }
    warnings.push(message);
  }

  if (warnings.length > 0) {
    console.warn("Warnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  let hasFailure = false;

  if (blockedByExtension.length > 0) {
    hasFailure = true;
    console.error("\nBlocked file extensions detected:");
    for (const file of blockedByExtension) {
      console.error(`- ${file.path} (${formatBytes(file.size)})`);
    }
  }

  if (oversized.length > 0) {
    hasFailure = true;
    console.error(`\nOversized files detected (>${formatBytes(maxBytes)}):`);
    for (const file of oversized) {
      console.error(`- ${file.path} (${formatBytes(file.size)})`);
    }
  }

  if (highRisk.length > 0) {
    hasFailure = true;
    console.error("\nPotentially sensitive file patterns detected:");
    for (const file of highRisk) {
      console.error(`- ${file.path} (${formatBytes(file.size)})`);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
    console.error("\nPackage audit failed. Review publish contents before release.");
    return;
  }

  console.log(
    `Package audit passed (${files.length} files inspected, blocked extensions: ${mergedBlockedExts.join(", ")}).`
  );
}

main();
