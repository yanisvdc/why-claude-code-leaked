# Adopt This in 5 Minutes

This guide helps maintainers copy the core controls into any npm repository.

## 1) Copy the Files

Copy these into your project:

- `scripts/audit-package.mjs`
- `scripts/generate-pack-manifest.mjs`
- `scripts/compare-pack-manifest.mjs`
- `package-audit.config.json`
- `.github/workflows/package-audit.yml`

## 2) Run Initial Audit

```bash
node scripts/audit-package.mjs
```

Fix any failed checks before continuing.

## 3) Generate Baseline Manifest

Run once after a known-good release setup:

```bash
node scripts/generate-pack-manifest.mjs
```

Commit `data/pack-manifest.json` to track future drift.

## 4) Add Package Scripts (optional)

In your `package.json`:

```json
{
  "scripts": {
    "audit:package": "node scripts/audit-package.mjs",
    "audit:manifest:generate": "node scripts/generate-pack-manifest.mjs",
    "audit:manifest:compare": "node scripts/compare-pack-manifest.mjs"
  }
}
```

## 5) Tune Policy for Your Risk Profile

Edit `package-audit.config.json`:

- lower `maxBytes` if your package should be small
- add blocked file extensions used in your ecosystem
- add extra `highRiskPatterns`
- set `failOnMissingFilesAllowlist` to `true` for strict mode
