# Technical Analysis: The Claude Code Packaging Incident (v2.1.88)

A comprehensive post-mortem and technical breakdown of the March 31, 2026, source code exposure involving Anthropic's Claude Code CLI.

> [!IMPORTANT]
> **Zero Proprietary Code Policy:** This repository does NOT host, mirror, or link to any leaked source code, binaries, or Anthropic intellectual property. It is strictly for educational analysis of npm packaging security and incident response.

---
<p align="center">
  <img src="https://github.com/user-attachments/assets/0ea82380-e41b-46c0-92a9-c5e4bf09a2d4" width="800"/>
</p>

## 📝 Incident Overview
On March 31, 2026, version **2.1.88** of the `@anthropic-ai/claude-code` package was published to the npm registry. Due to a configuration error, a **59.8 MB source map file** (`cli.js.map`) was included in the public distribution. This allowed researchers to reconstruct approximately **512,000 lines of unobfuscated TypeScript** across 1,906 files.

## 🛠️ The Root Cause (Technical Breakdown)
The leak resulted from a "triple-failure" chain in the CI/CD pipeline:

1.  **Missing `.npmignore`:** The build process generated a **59.8 MB** source map. Because the `.npmignore` file (or the `files` field in `package.json`) did not explicitly exclude `*.map` files, it was bundled into the production npm package.
2.  **Bun Runtime Bug:** Reports suggest a known issue in the **Bun runtime** (Bun bug #28001) caused source maps to be generated even when the configuration explicitly requested they be disabled for production builds.
3.  **R2 Bucket Misconfiguration:** The source maps contained pointers to a ZIP archive on a Cloudflare R2 bucket. This bucket was inadvertently set to "Public," allowing the full codebase to be retrieved via the metadata found in the npm package.

## 🏗️ Architectural Insights (The "Harness")
Research by security experts like [Chaofan Shou](https://x.com) revealed that the competitive moat is the **agent harness**, not just the model:

*   **KAIROS (Autonomous Mode):** A feature-gated mode (referenced 150+ times) for "Dreaming"—an offline process where a sub-agent consolidates memory and plans while the user is idle.
*   **Undercover Mode:** A utility designed to "ghost-contribute" AI-written code to open-source projects by sanitizing commit messages to hide Anthropic's involvement.
*   **ULTRAPLAN:** A remote planning system that offloads complex tasks to a Cloud Container running **Opus 4.6** for up to 30 minutes of "deep thinking".
*   **Buddy Mode:** A hidden April Fools' feature: a Tamagotchi-style pet (18 species, including "Axolotl" and "Chonk") with RPG stats like `CHAOS` and `SNARK`.

## 🛠️ Defensive Toolkit
Add these to your project to prevent becoming the next headline:

### 1. The "Anti-Leak" CI Guardrail
Place this in `.github/workflows/audit.yml` to automatically fail any PR that includes source maps in the build artifact:
```yaml
name: Production Artifact Audit
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for .map files
        run: |
          if find ./dist -name "*.map" | grep -q "."; then
            echo "❌ CRITICAL: Source maps detected in dist folder!"
            exit 1
          fi
```

## 🔍 Key Findings from Research Reports
According to public analysis by security researchers (e.g., Chaofan Shou), the exposure revealed:
*   **The Orchestration Layer:** Detailed logic on how the agent coordinates multi-step tool use and bash command validation.
*   **Hidden Features:** References to unreleased modes such as `/buddy` (a Tamagotchi-style interaction) and "Dream" mode (background reasoning).
*   **Safety Guardrails:** Internal system prompts and "Undercover" mode logic used to sanitize AI-generated commits.

## ⏰ Timeline of Events (March 31, 2026)
*   **04:00 UTC:** Version 2.1.88 is pushed to npm.
*   **04:23 UTC:** Security researchers identify the exposed source map on X (Twitter).
*   **08:00 UTC:** Anthropic acknowledges the "human error," pulls the package, and releases a statement confirming no customer data was compromised.

## 📚 Educational Resources & References
*   [The Hacker News: Claude Code Leaked via npm Packaging](https://thehackernews.com)
*   [WSJ: Anthropic Races to Contain Code Leak](https://wsj.com)
*   [VentureBeat: What We Know About the Claude Code Exposure](https://venturebeat.com)

---
*This repository is maintained for security research purposes. If you are a representative of Anthropic and have concerns regarding this analysis, please open an issue.*
