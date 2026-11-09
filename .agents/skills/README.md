# Multica Internal Skills (versioned reference)

Versioned copies of Multica's built-in internal skills as injected into agent
run workdirs (`~/multica_workspaces/<workspace>/<run>/workdir/.cursor/skills/`).

> **Source**: `~/multica_workspaces/ac9449c6-3340-49ac-a478-9eb0efd844d9/b1462258/`
> (ACG-13 run template, captured 2026-08-16). **NOT** agent-facing local skills —
> all three are `user-invocable: false`; the `bootstrap`-style full list includes
> 10 skills, only the 3 core workflow ones are tracked here.

| Skill | Purpose | user-invocable |
|-------|---------|----------------|
| [`multica-autopilots`](./multica-autopilots/) | create/trigger/debug autopilots: `trigger(schedule|webhook|manual)` → `autopilot_run` → execution mode → dispatch; webhook durable admission (`200 status=accepted|skipped` + `run_id`) | false |
| [`multica-creating-agents`](./multica-creating-agents/) | create/inspect agents via `multica agent` CLI or `POST /api/agents` | false |
| [`multica-mentioning`](./multica-mentioning/) | build `mention://(member|agent|squad|issue|all)/<uuid>` links; agent mentions enqueue runs | false |

Reference maps (API endpoints the skill wraps) live in each skill's
`references/` subfolder.

- `multica-cli` (the public skill) is tracked separately under
  `.cursor/skills/multica-cli/` etc., synced from github.com/multica-ai/multica-cli.
- `multica-onboarding`, `-projects-and-resources`, `-runtimes-and-repos`,
  `-skill-importing`, `-squads`, `-working-on-issues` are also injected but not
  yet versioned here; add on demand.