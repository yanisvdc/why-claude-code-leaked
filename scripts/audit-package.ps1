#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Wrapper around the Node audit for Windows maintainers.
node "scripts/audit-package.mjs" $args
