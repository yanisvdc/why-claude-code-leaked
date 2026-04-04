# Claude Code Leak Repository: Packaging Security Case Study (v2.1.88)

**Pre-publish guardrails** so npm packages do not accidentally ship debug files (like source maps) or other sensitive artifacts.

**New here?** Skim **Understanding the leak** (plain language) or open the **[full glossary](docs/glossary.md)** if terms like *npm*, *agent*, or *model weights* are unfamiliar. The **toolkit** section is for people who ship JavaScript packages.

[![Package Audit](https://github.com/yanisvdc/why-claude-code-leaked/actions/workflows/package-audit.yml/badge.svg?branch=main&event=push)](https://github.com/yanisvdc/why-claude-code-leaked/actions/workflows/package-audit.yml)
[![License](https://img.shields.io/github/license/yanisvdc/why-claude-code-leaked)](https://github.com/yanisvdc/why-claude-code-leaked/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/yanisvdc/why-claude-code-leaked)](https://github.com/yanisvdc/why-claude-code-leaked/commits/main)

Feel free to **Star** the repo (top right on GitHub) if you want to keep it handy for reference.

> [!IMPORTANT]
> **Zero Proprietary Code Policy** — This project does **not** host or link to leaked proprietary source or binaries. It teaches **release safety** and ships reusable audit tooling.

---

<p align="center">
  <img src="https://github.com/user-attachments/assets/0ea82380-e41b-46c0-92a9-c5e4bf09a2d4" width="680" alt="Packaging security case study visual"/>
</p>

## Understanding the leak (short)

*Educational summary of public discussion and reporting—not independent forensic verification.*

**Glossary:** See **[docs/glossary.md](docs/glossary.md)** for *LLM / weights / npm / agent / source map / supply chain* explained for **non-developers** and **data scientists**.

**What broke:** Reporting describes a **packaging error** in `@anthropic-ai/claude-code` **v2.1.88** (late March 2026): files that should not ship to every `npm install` user were published, which made **client-side product code** (CLI, tooling, prompts) much easier to reconstruct. That is **not** the same as “the model weights leaked.” Vendor framing: **human error**, not a classic intrusion—[CNBC on Anthropic’s statement](https://www.cnbc.com/2026/03/31/anthropic-leak-claude-code-internal-source.html).

**Broad agreement:** (1) **Weights/training data** are a different asset class; consensus is they were **not** the exposed core here. (2) The sensitive *shape* of the story is **orchestration**: prompts, tools, permissions, workflows around the model. (3) That matches how **agents** are built today: model + control layer.

**Often overclaimed:** Internal **codenames** ≠ proven roadmap; **“be careful / don’t hallucinate”** prompts are normal guardrails, not proof the model is uniquely bad; **“full prediction engines”** are easy to hype—assume **bounded** experiments unless proven.

**IP note:** Public code visibility **≠** open source or a license to redistribute. When in doubt, use **official vendor channels** only.

## Security risks (after the headline)

- **Fake “leak” downloads** — Treat unofficial repos/archives as **malware risk**; see [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research/anthropic-claude-code-leak).
- **Smarter lures** — More product detail can mean more convincing **malicious project layouts** (hooks, config). Assume **untrusted repos are hostile**.
- **Agents amplify mistakes** — Shell + file access on a bad clone is high impact.
- **Noisy news days** — Pin installs; unrelated **npm** incidents can coincide in time.
- **This repo** helps **publishers** audit what ships; it is **not** a full SCA/secrets/SBOM program.

## Use this in 5 minutes

Copy: `scripts/audit-package.mjs`, `scripts/generate-pack-manifest.mjs`, `scripts/compare-pack-manifest.mjs`, `package-audit.config.json`, `.github/workflows/package-audit.yml`.

```bash
node scripts/audit-package.mjs
node scripts/generate-pack-manifest.mjs
node scripts/compare-pack-manifest.mjs
```

**Modes:** minimal = audit only · standard = audit + manifest + CI · strict = tighter `package-audit.config.json` / presets in `configs/presets/`. Details: **[docs/adopt-in-5-minutes.md](docs/adopt-in-5-minutes.md)**.

**CI:** `.github/workflows/package-audit.yml` checks out the repo, uses Node 24, runs `npm test` when present, runs the audit, and compares to `data/pack-manifest.json` if you commit a baseline.

<p align="center">
  <img src="https://github.com/user-attachments/assets/b2149769-d5d6-4fe9-8cc3-ab38fa27bc10" width="740" alt="Use this in 5 minutes"/>
</p>

## Quick start (your package)

Run from a directory that has **`package.json`** (your library or CLI).

```bash
node scripts/audit-package.mjs
npm test   # in this repo only; adds confidence in the scripts
```

Strict example: `node scripts/audit-package.mjs --max-bytes=300000 --fail-on-license-missing`

**Defaults:** blocks `.map`, flags risky paths, size limits; tune via `package-audit.config.json`. **False positives:** [docs/false-positives-and-tuning.md](docs/false-positives-and-tuning.md).

## What ships in this repository

| Area | Path |
|------|------|
| Audit scripts | `scripts/*.mjs`, `*.sh`, `*.ps1` |
| Policy | `package-audit.config.json`, `configs/presets/` |
| CI | `.github/workflows/package-audit.yml` |
| Example package | `examples/npm-secure-package/` |
| Incident data | `data/sources.json`, `data/timeline.json` |
| Docs | `docs/` (FAQ, checklist, threat matrix, sample outputs, scope, support, runbooks) |
| Templates | `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` |
| Tests | `tests/`, `npm test` |

**Learn more:** [docs/claude-code-leak-faq.md](docs/claude-code-leak-faq.md) · [docs/npm-hardening-checklist.md](docs/npm-hardening-checklist.md) · [docs/threat-model-matrix.md](docs/threat-model-matrix.md)

**npm facts (from official docs):** publish contents follow `files` / ignore rules; `npm pack --dry-run` previews the tarball; public buckets can widen impact if artifacts point there—[Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).

## Primary references

- [npm `package.json`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json/) · [publish](https://docs.npmjs.com/cli/v9/commands/npm-publish) · [pack](https://docs.npmjs.com/cli/v8/commands/npm-pack)
- [Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Bun #28001](https://github.com/oven-sh/bun/issues/28001) (tooling context, not causal proof)
- [The Register](https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/) · [VentureBeat](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know/)
- [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research/anthropic-claude-code-leak) · [CNBC](https://www.cnbc.com/2026/03/31/anthropic-leak-claude-code-internal-source.html)

Full index: **`data/sources.json`**.
