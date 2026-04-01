# npm Hardening Checklist

Use this before every release.

## Packaging Boundaries

- [ ] Use `files` in `package.json` (allowlist) instead of relying only on ignore files
- [ ] Confirm no debug artifacts (`*.map`, debug logs, test fixtures) are included
- [ ] Confirm no secrets or credentials are in the package tarball
- [ ] Review large files and justify each one

## Pre-Publish Validation

- [ ] Run `npm pack --dry-run --json` and inspect full file list
- [ ] Run `node scripts/audit-package.mjs`
- [ ] Verify version, changelog, and package metadata
- [ ] Verify `license`, `repository`, and `engines` fields

## CI/CD Guardrails

- [ ] Fail CI when blocked extensions are present
- [ ] Fail CI when artifact files exceed policy size threshold
- [ ] Require manual approval for publish jobs
- [ ] Keep publish permissions scoped and least-privileged

## Storage and Artifact Exposure

- [ ] Review object storage policy defaults (private-by-default)
- [ ] Ensure development/public endpoints are disabled when not needed
- [ ] Require explicit access controls for internal artifacts
- [ ] Rotate credentials and keys used in release automation

## Incident Readiness

- [ ] Maintain a rollback/unpublish response runbook
- [ ] Keep security contact process in `SECURITY.md`
- [ ] Prepare a public statement template for packaging incidents
- [ ] Capture timeline and remediation details after any incident
