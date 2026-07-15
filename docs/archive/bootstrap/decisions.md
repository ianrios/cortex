# Cortex — Confirmed Decisions (v0.1)

## Project Identity
- Project name: Cortex
- Domain: Engineering cognition runtime (not AI wrapper, not chatbot)
- Primary interaction: terminal-first (TUI-oriented)

## Core Problem Focus
- Persistent memory across sessions is the primary unsolved problem
- Secondary focus: engineering workflow orchestration

## User Scope
- Primary user: full-stack engineer working on software projects
- Multi-repo support required via directory/workspace context
- Must work on arbitrary codebases (not project-specific hardcoding)

## Agent Philosophy
- Primary stance: collaborative agent (not fully autonomous)
- Secondary: tool-capable operator
- Tertiary: autonomous behavior (future exploration)

## Reasoning Requirements
- All agent reasoning must be fully inspectable
- Debuggable execution traces required

## Memory Philosophy (confirmed intent level)
- Memory is multi-layered (not single store)
- Must capture:
  - decisions
  - intent (why something was done)
  - architectural rationale
  - session continuity
- Cross-session persistence is required
- Memory must be searchable and evolvable

## Execution Safety Model
- Dangerous operations require approval by default:
  - file deletion
  - git operations
  - migrations
  - system commands
- Users may later whitelist/blacklist actions

## Model Strategy
- Model-agnostic system
- Must support swapping between providers (e.g. Claude, OpenAI, others)
- No assumption of a single LLM backend

## Storage Philosophy
- Local-first system
- Per-project workspace concept required
