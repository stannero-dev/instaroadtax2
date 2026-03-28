

# Project Memory — instaroadtax
> 160 notes | Score threshold: >40

## Safety — Never Run Destructive Commands

> Dangerous commands are actively monitored.
> Critical/high risk commands trigger error notifications in real-time.

- **NEVER** run `rm -rf`, `del /s`, `rmdir`, `format`, or any command that deletes files/directories without EXPLICIT user approval.
- **NEVER** run `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, or any destructive database operation.
- **NEVER** run `git push --force`, `git reset --hard`, or any command that rewrites history.
- **NEVER** run `npm publish`, `docker rm`, `terraform destroy`, or any irreversible deployment/infrastructure command.
- **NEVER** pipe remote scripts to shell (`curl | bash`, `wget | sh`).
- **ALWAYS** ask the user before running commands that modify system state, install packages, or make network requests.
- When in doubt, **show the command first** and wait for approval.

**Stack:** Unknown stack

## Important Warnings

- **gotcha in frontend.err.log** — File updated (external): frontend.err.log

Content summary (5 lines):

- **gotcha in test_network.py** — File updated (external): backend/venv/Lib/site-packages/pandas/tests/i

## Project Standards

- what-changed in local_storage.json — confirmed 3x
- Replaced auth AsyncIOMotorClient — confirmed 3x
- what-changed in frontend.log — confirmed 4x
- what-changed in RECORD — confirmed 40x
- what-changed in task.md — confirmed 3x
- what-changed in task.md.resolved — confirmed 3x
- Version your API from day 1 (/api/v1/)
- Use consistent response format across all endpoints

## Known Fixes

- ❌ Cannot find module 'ajv/dist/compile/codegen' → ✅ problem-fix in frontend.err.log

## Recent Decisions

- decision in aliases.py
- decision in .gitignore

## Verified Best Practices

- Agent generates new migration for every change (squash related changes)
- Agent installs packages without checking if already installed

## Available Tools (ON-DEMAND only)
- `query(q)` — Deep search when stuck
- `find(query)` — Full-text lookup
> Context above IS your context. Do NOT call load() at startup.
