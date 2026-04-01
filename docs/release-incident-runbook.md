# Release Incident Runbook (First 60 Minutes)

Use this when a package release may have exposed unintended artifacts.

## 0-10 Minutes: Contain

- Identify affected package name and versions.
- Stop further releases immediately.
- Revoke or pause publish tokens used in automation.
- If object storage is involved, disable public endpoints first.

## 10-20 Minutes: Verify Scope

- Reproduce package contents with `npm pack --dry-run --json`.
- Record exactly which files were exposed.
- Classify severity:
  - **P0**: Secrets/credentials or direct exploit path
  - **P1**: Proprietary source/debug artifacts
  - **P2**: Non-sensitive but incorrect artifact inclusion

## 20-30 Minutes: Remove and Patch

- Remove/replace impacted versions where platform policy allows.
- Patch packaging boundaries (`files`, ignore rules, build output).
- Add explicit CI blocks for exposed file classes.

## 30-45 Minutes: Rotate and Harden

- Rotate credentials if any chance of exposure.
- Confirm storage access controls (`private` by default).
- Generate and review fresh package manifest baseline.

## 45-60 Minutes: Communicate

- Publish an initial factual statement:
  - what happened
  - what was/was not exposed
  - immediate remediation completed
- Open an internal postmortem issue using incident template.
- Track follow-up actions with owners and deadlines.

## Mandatory Artifacts After Stabilization

- Timeline (`data/timeline.json`) update
- Source references (`data/sources.json`) update
- Policy changes in `package-audit.config.json`
- Checklist/process update in docs
