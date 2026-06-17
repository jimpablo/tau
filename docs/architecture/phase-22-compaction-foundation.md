# Phase 22: Compaction Replay Foundation

This phase starts Tau's compaction and context-management work without adding
model-driven summarization yet.

The implementation lives in:

```text
src/tau_agent/session/entries.py
src/tau_agent/session/memory.py
```

## What was added

`CompactionEntry` is now meaningful during session replay.

When `SessionState.from_entries()` sees a compaction entry, it:

1. removes message entries whose ids appear in `replaces_entry_ids`
2. appends one provider-neutral summary message
3. keeps the original append-only entries intact

The summary message currently uses this stable form:

```text
Previous conversation summary:
<summary>
```

## Why It Exists

Tau needs compaction to reduce the active provider context while preserving the
full session file. This keeps Pi's append-only session property:

```text
session file = durable history
SessionState.messages = reconstructed active context
```

Future `/compact` work can append `CompactionEntry` values without editing or
deleting old entries.

## Boundary

This foundation is in `tau_agent` because replaying session entries is a
portable harness concern. It does not know about slash commands, Textual, Rich,
Tau home paths, token thresholds, or which model creates a summary.

Command UX, token estimation, automatic thresholds, and model-generated
summaries belong in later `tau_coding` work.

## Tests

The phase is covered by:

```text
tests/test_session.py
```

The tests verify:

- compaction entries round-trip through JSONL
- linear replay replaces compacted messages with a summary
- branch replay applies compaction only on the active branch path
