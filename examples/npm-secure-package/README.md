# Example: Secure npm Package Setup

This folder is a copyable starter showing safer publish defaults.

## Highlights

- explicit `files` allowlist in `package.json`
- prepublish guard using package audit script
- no source maps in published output
- simple baseline manifest workflow

## Try It

```bash
npm install
npm run build
npm run audit:package
npm pack --dry-run --json
```
