Technical Analysis: The Claude Code Packaging Incident
A detailed post-mortem and analysis of the March 31, 2026, source code exposure of Anthropic's Claude Code CLI.
[!CAUTION]
Zero Proprietary Code Policy: This repository does not host, mirror, or link to leaked source code, binaries, or intellectual property. All information is derived from public post-mortems and security researcher reports.
Executive Summary
On March 31, 2026, version 2.1.88 of the @anthropic-ai/claude-code package was published to the npm registry. Due to a series of cascading configuration errors, the package included a massive source map file that allowed the reconstruction of approximately 512,000 lines of original TypeScript source code.
The Root Cause: A Triple-Failure Chain
The leak was not a "hack" but a human-led packaging error involving three specific technical lapses:
Missing .npmignore Entry: The build process generated a cli.js.map file (approx. 59.8 MB). Because the .npmignore or files field in package.json did not explicitly exclude .map files, it was bundled into the public distribution.
The "Bun" Runtime Bug: Claude Code is built on the Bun runtime (which Anthropic acquired in 2025). Researchers pointed to a known issue (Bun bug #28001) where source maps were occasionally included in production builds despite being disabled in the configuration.
Public R2 Bucket Exposure: The source map didn't just contain code; it contained references to a ZIP archive on Anthropic’s Cloudflare R2 storage. This bucket was reportedly configured for public access, allowing anyone with the URL to download the full, unobfuscated codebase.
What Was Exposed?
According to reports from VentureBeat and Layer5, the 1,906 exposed files revealed the "harness" of the AI agent:
The Orchestration Layer: How Claude handles multi-step tool execution and bash validation.
Feature Flags: Approximately 44 hidden flags for unreleased features like "Dream" mode (background thinking) and a Tamagotchi-style "/buddy" mode.
"Undercover" Mode: A utility designed to detect public repositories and automatically sanitize AI-generated commit messages to hide Anthropic-internal involvement.
Safety Logic: Hardcoded guardrails and internal system prompts used to keep the agent within its operational boundaries.
Timeline of Events (UTC)
00:21: Unrelated npm supply-chain attack on axios begins (cautionary note for developers updating that morning).
04:00: Claude Code v2.1.88 is pushed to npm.
04:23: Security researcher Chaofan Shou identifies the source map on X (Twitter).
~08:00: Anthropic pulls the package and issues a statement confirming "human error".
Security Implications
Anthropic stated that no customer data or credentials were compromised. However, security teams at organizations like Tanium recommend that enterprises review their internal use of the tool, as the leak significantly lowers the barrier for attackers to find bypasses in the agent's permission system.
Further Reading
The Great Claude Code Leak (DEV Community)
Anthropic Races to Contain Leak (WSJ/Yahoo)
