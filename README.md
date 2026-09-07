# outlook-folder-filing

A Claude skill for sorting an Outlook or Microsoft 365 inbox into the folders the owner already has,
and leaving inbox rules behind so it stays sorted.

Run against a real 20-year work mailbox it took the inbox from **565 messages to 5 in a day** and
Sent Items from **507 to 112**, using a folder tree of 62 folders that nobody had ever documented.

**The premise:** you do not design the folders. The owner already answered every classification
question by filing thousands of messages over years. Read the answer key, do not rewrite it.

- Installs `@softeria/ms-365-mcp-server` with four delegated permissions and **no ability to send
  mail**.
- Learns sender and domain habits from the existing folders, with evidence counts.
- Falls back to subject words, then to reading message bodies.
- Files Sent Items too, where the signals invert and a colleague on the Cc line means nothing.
- Shows the whole classification for approval before moving anything.
- Never deletes.

Read [`SKILL.md`](./SKILL.md). The traps section is the part worth your time: rules that AND their
conditions, rules that never touch existing mail, and the sign-in that lands on the wrong mailbox.

## Not for Gmail

Gmail labels, Outlook moves. For Gmail see
[gmail-label-cleanup](https://github.com/noambrand/gmail-label-cleanup).

## Install

Copy this folder into `~/.claude/skills/`.

## What ships here

A method and a template. No rulebook: a filled one names its owner's clients, colleagues and
projects, and belongs nowhere public.

MIT.
