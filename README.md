# Claude Code Leak Repository: Packaging Security Case Study (v2.1.88)

Pre-publish guardrails for npm maintainers to catch accidental artifact exposure before release.

[![Package Audit](https://github.com/yanisvdc/why-claude-code-leaked/actions/workflows/package-audit.yml/badge.svg?branch=main&event=push)](https://github.com/yanisvdc/why-claude-code-leaked/actions/workflows/package-audit.yml)
[![License](https://img.shields.io/github/license/yanisvdc/why-claude-code-leaked)](https://github.com/yanisvdc/why-claude-code-leaked/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/yanisvdc/why-claude-code-leaked)](https://github.com/yanisvdc/why-claude-code-leaked/commits/main)

> [!IMPORTANT]
> **Zero Proprietary Code Policy**  
> This project does **not** host, mirror, or link to leaked proprietary source code or binaries.  
> It focuses on release engineering, package auditing, and supply chain defense patterns.

---

<p align="center">
  <img src="https://github.com/user-attachments/assets/0ea82380-e41b-46c0-92a9-c5e4bf09a2d4" width="800" alt="Packaging security case study visual"/>
</p>

## What This Repo Adds

- A practical, copy-pasteable npm publish safety workflow
- CI checks that fail on source maps and suspicious tarball growth
- Structured, machine-readable references and timeline data
- Maintainer docs to prevent repeat incidents in any Node ecosystem project

## Use This In 5 Minutes

Copy these into your repo:

- `scripts/audit-package.mjs`
- `scripts/generate-pack-manifest.mjs`
- `scripts/compare-pack-manifest.mjs`
- `package-audit.config.json`
- `.github/workflows/package-audit.yml`

Run:

```bash
node scripts/audit-package.mjs
node scripts/generate-pack-manifest.mjs
node scripts/compare-pack-manifest.mjs
```

Full quickstart: `docs/adopt-in-5-minutes.md`

<p align="center">
  <img src="https://github.com/user-attachments/assets/b2149769-d5d6-4fe9-8cc3-ab38fa27bc10" width="800" alt="Use this in 5 minutes"/>
</p>

## Recommended Adoption Paths

- **Minimal mode**: run `scripts/audit-package.mjs` before publish
- **Standard mode**: audit + baseline manifest + CI workflow
- **Strict mode**: enforce allowlist usage and tighter size/risk policy via config presets

Start with Standard mode for most teams.

## What the Package Audit Workflow Does

The GitHub Actions workflow at `.github/workflows/package-audit.yml` runs on pull requests, pushes to `main`, and manual dispatch.

It:

1. checks out the repository
2. sets up Node.js 24
3. installs dependencies when `package.json` exists
4. runs `scripts/audit-package.mjs` to block risky package contents
5. compares against `data/pack-manifest.json` (when present) to detect unexpected tarball drift

This is a release-hygiene guardrail to catch accidental packaging exposure before publish.

## Defaults vs Policy Choices

- **Safe defaults**: block `.map`, flag sensitive patterns, and detect oversized files
- **Configurable policy**: thresholds, blocked extensions, and risk patterns are editable
- **Stricter recommendations**: sensitive/internal packages should enable allowlist enforcement

See `package-audit.config.json` and `configs/presets/`.

## Incident Snapshot (Public Reporting)

Multiple reports on March 31, 2026 describe a packaging incident involving `@anthropic-ai/claude-code` v2.1.88:

- A large source map (`cli.js.map`) was included in a public npm release
- Anthropic described it as a human-error packaging issue, not a breach
- Public reporting says no customer data or credentials were exposed

This repository treats the event as a case study in artifact governance, not a reverse-engineering archive.

## Confirmed vs Inferred

### Confirmed (from reporting + docs)
- npm publishes files based on `package.json` `files`, `.npmignore`, and defaults
- `npm pack --dry-run` can preview what ships before publish
- public object storage settings can expose artifacts if misconfigured

### Inferred (treat with caution)
- exact internal build chain interactions
- whether a specific runtime bug was causal versus incidental
- architecture claims from third-party analysis of leaked material

## Maintainer Toolkit

Use these assets directly in your own repositories:

- `scripts/audit-package.mjs` - cross-platform package-content auditor
- `scripts/generate-pack-manifest.mjs` - creates baseline publish manifest
- `scripts/compare-pack-manifest.mjs` - detects tarball drift against baseline
- `scripts/audit-package.sh` - shell wrapper for CI pipelines
- `scripts/audit-package.ps1` - PowerShell wrapper for Windows maintainers
- `package-audit.config.json` - customizable audit policy
- `.github/workflows/package-audit.yml` - GitHub Actions guardrail
- `docs/npm-hardening-checklist.md` - release checklist
- `docs/source-map-risks.md` - threat model and controls
- `docs/adopt-in-5-minutes.md` - copy-paste onboarding for maintainers
- `docs/claude-code-leak-faq.md` - search-friendly FAQ and safe usage guide
- `docs/sample-outputs.md` - passing and failing command outputs
- `docs/threat-model-matrix.md` - risk to control mapping
- `docs/false-positives-and-tuning.md` - tuning guide for noisy checks
- `docs/support-and-compatibility.md` - tested versions and platform notes
- `docs/scope-boundary.md` - what this toolkit covers vs does not cover

## Quick Start

```bash
node scripts/audit-package.mjs
```

Optional strict mode:

```bash
node scripts/audit-package.mjs --max-bytes=300000 --fail-on-license-missing
```

Generate and compare baseline manifest:

```bash
node scripts/generate-pack-manifest.mjs
node scripts/compare-pack-manifest.mjs
```

What it checks:

- blocks `.map` files by default
- flags suspicious high-risk file patterns
- blocks files over a configurable size threshold
- warns when a package allowlist (`files`) is missing
- supports repo-specific policy in `package-audit.config.json`
- highlights unexpected tarball growth versus your committed baseline

## Data for Ongoing Updates

- `data/sources.json` - curated public source index
- `data/timeline.json` - event timeline with confidence tags
- `scripts/fetch_sources.py` - metadata refresher for source URLs

## Community Ops Kit

- `.github/ISSUE_TEMPLATE/packaging-incident-report.yml` - structured incident intake
- `.github/ISSUE_TEMPLATE/audit-policy-request.yml` - policy improvement requests
- `.github/PULL_REQUEST_TEMPLATE.md` - mandatory release-hygiene checklist
- `docs/release-incident-runbook.md` - first 60-minute response playbook
- `docs/repo-release-checklist.md` - dogfooding checklist for this repo
- `examples/npm-secure-package/` - copyable starter package with safe defaults

## Policy Presets

Preset files are available in `configs/presets/`:

- `library.json`
- `cli.json`
- `frontend.json`
- `internal.json`
- `high-sensitivity.json`

Use one as your `--config` value or copy into your own `package-audit.config.json`.

## Script Tests

The audit logic has integration tests under `tests/`:

```bash
npm test
```

## Why This Is Useful to the Community

Most incident writeups stop at "what happened."  
This repo provides reusable controls maintainers can apply immediately:

- pre-publish artifact visibility
- CI policy enforcement
- safer defaults for package boundaries
- repeatable documentation for team release discipline

## Primary References

- [npm package.json docs](https://docs.npmjs.com/cli/v9/configuring-npm/package-json/)
- [npm publish docs](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [npm pack docs](https://docs.npmjs.com/cli/v8/commands/npm-pack)
- [Cloudflare R2 public buckets docs](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Bun issue #28001](https://github.com/oven-sh/bun/issues/28001)
- [The Register coverage](https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/)
- [VentureBeat coverage](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know/)

See `data/sources.json` for categorized references and confidence notes.
