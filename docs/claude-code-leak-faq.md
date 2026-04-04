# Claude Code Leak FAQ (beginner-friendly)

If you are **new to npm or supply-chain security**, read this FAQ first, then the main [README](../README.md).

**Terms:** see the [glossary](./glossary.md) (written for non-developers and for data scientists).

---

## What is this repository?

A **teaching + tooling** project about **npm packaging safety**. It explains—in plain language—why accidental files in a published package can cause big problems, and it gives scripts and CI you can reuse.

It does **not** host, link, or help you find leaked proprietary source code.

---

## What happened in the Claude Code incident (simple version)?

Think of it in three layers:

1. **The model** (weights, training data) — widely discussed as **not** the thing that leaked in this story.
2. **The product around the model** — terminal tool, prompts, tool use, workflows. Discussion focuses here.
3. **The mistake** — a **release/packaging** problem: something that should not ship to every `npm install` user ended up in a public package.

So the lesson is mostly: **treat your publish pipeline like a security boundary**, not “someone hacked Anthropic’s servers.”

---

## What do people *think* the leak “proves”?

**Reasonable takeaways** (common across forums and articles):

- Modern AI products are **stacks**: model + tools + prompts + policies.
- **Prompting and runtime rules** are real engineering work, not afterthoughts.
- **Agents** (multi-step tool use) are where a lot of product differentiation lives.

**Easy to overread** (stay skeptical):

- A **codename** in source is not a confirmed public roadmap.
- Prompts that say “check your work” are **normal**; they are not proof the model is uniquely unreliable.
- Claims about **“prediction layers”** or deep parallel simulation are often **speculative** unless demonstrated with evidence.

For a longer walkthrough, see the **“Understanding the Claude Code leak”** section in the [README](../README.md).

---

## Is this a Claude Code leak archive?

**No.** This repo is a **prevention toolkit**:

- audit scripts
- GitHub Actions workflow
- optional manifest drift checks
- checklists and runbooks

---

## How do I use this in my own project?

Follow the steps in [adopt-in-5-minutes.md](./adopt-in-5-minutes.md). Short version:

1. Copy the scripts and workflow into your repo.
2. Run `node scripts/audit-package.mjs`.
3. Add CI so every PR checks what would ship.

---

## Where are the references?

- `data/sources.json` — outlets, docs, and research we cite
- `data/timeline.json` — dated events with confidence tags

If you are writing a report, **cite those sources directly** instead of treating this FAQ as a primary reference.
