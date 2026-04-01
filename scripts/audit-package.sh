#!/usr/bin/env bash
set -euo pipefail

# Wrapper around the Node audit for CI usage.
node scripts/audit-package.mjs "${@}"
