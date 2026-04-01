# Contributing

Thanks for helping improve package security practices.

## Contribution Types

- CI/CD hardening improvements
- Packaging audit scripts
- Reference-quality security documentation
- Public-source timeline and reference curation

## Rules

- Keep content original and educational
- Do not include proprietary leaked source code
- Prefer official docs and reputable reporting
- Mark uncertain claims as unverified

## Local Validation

Run before submitting:

```bash
node scripts/audit-package.mjs
```

If this repo becomes a package later, also run:

```bash
npm pack --dry-run --json
```

## Pull Request Expectations

- Explain what changed and why
- Link to supporting sources for factual claims
- Keep changes scoped and easy to review
