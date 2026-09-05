# Workspace Execution Rules & Anti-Cancellation Protocol

## 1. Automated Access & Autonomous Execution
- **Automated Access Granted**: Execute terminal commands, deterministic scripts, file edits, and tool operations directly and autonomously without waiting or prompting for permission.
- **Proactive Execution**: Run tools, execute scripts in `execution/`, start background servers when needed, and resolve issues without manual confirmation prompts.

## 2. Robust Command Execution (Prevent Timeouts & Cancellations)
- **Non-Interactive Execution**: Always pass non-interactive flags to CLI commands (e.g. `pip install -q`, `npm install --yes`, `git --no-pager`).
- **Paging & Output Control**: Ensure commands never hang on pagination prompts.
- **Async & Background Handling**: For long-running servers or watchers, always launch them as daemons (`IsDaemon: true`).
- **Error Trapping**: Always inspect return codes and standard error before concluding. Self-anneal when scripts fail.

## 3. Persistent Context & 3-Layer Architecture (`Agents.md`)
- **Directives First**: Read and update directives in `directives/`.
- **Deterministic Scripts**: Push complexity into deterministic Python scripts in `execution/`.
- **Manus-Style Working Memory on Disk**: Maintain `Task.md`, `task_plan.md`, `findings.md`, and `progress.md` in the workspace root at all times.
- **Session Recovery**: After context clearing or reset, re-read `task_plan.md` and `progress.md` to resume exactly where the workflow left off.
