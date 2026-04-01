# Source Map Risks in Production Packages

Source maps are useful for debugging but can expose implementation details when shipped unintentionally.

## Why This Matters

Depending on build and deploy configuration, source maps can reveal:

- original source paths and module structure
- unobfuscated symbols and comments
- references to internal artifact locations

## Common Failure Pattern

1. Build emits source maps by default
2. Packaging boundaries are broad or implicit
3. CI has no "artifact denylist" policy
4. Release is published before tarball review

## Controls

- Prefer explicit `files` allowlist in `package.json`
- Add CI checks that fail on `.map` and other disallowed artifacts
- Use `npm pack --dry-run --json` as a release gate
- Add size anomaly checks to catch unexpected growth
- Keep object storage private by default and disable public dev URLs unless required

## Operational Rule of Thumb

Treat source maps as potentially sensitive build artifacts until proven safe for your release model.
