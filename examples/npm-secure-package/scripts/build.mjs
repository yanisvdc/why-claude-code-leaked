#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "src", "index.js");
const outDir = path.join(root, "dist");
const outPath = path.join(outDir, "index.js");

const src = readFileSync(srcPath, "utf8");
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, src, "utf8");

console.log(`Built ${outPath}`);
