---
name: outlook-folder-filing
description: Use when someone wants their Outlook or Microsoft 365 inbox or Sent Items sorted into folders, or wants inbox rules built so it stays sorted. Installs a Graph MCP server, learns the person's own filing habits from the folders they already have, and files the backlog. Not for Gmail, which labels instead of moving.
---

# Filing an Outlook inbox into the folders that are already there

This is the Outlook counterpart to `gmail-label-cleanup`, and it is **not the same job**. Gmail
labels: the mail stays in one pile and gains tags. Outlook **moves**: a folder tree already exists,
someone built it over years, and the work is putting mail into it.

Run against a real mailbox this reduced an inbox from **565 messages to 5 in a day** and Sent Items
from **507 to 112**, and left rules behind so the inbox stays that way.

## The one thing to understand before starting

**You do not design the folders. They exist, and the person who made them is not you.**

The mailbox owner has already answered every classification question you are about to ask, by
filing thousands of messages. Their folder tree is the answer key. Your job is to read it, not to
improve it. In the run this skill comes from, the owner had 24 folders under the inbox and 38 more
in an archive folder for closed projects, about 11,700 messages in all. Nobody wrote that structure
down anywhere. It had to be reverse-engineered from the mail sitting in it.

Concretely, before you touch anything:

1. List the folders, including children of children. The interesting ones are often nested.
2. Sample real messages out of each one, sender and subject.
3. Derive the rule from what you see, then show the owner the evidence beside the rule.

**Never create a folder without being asked.** In the source run, "Modiin goes to Modiin" produced a
new empty folder, and the owner then said the real folder was called something else entirely and
lived inside the archive. The empty one had to be deleted. Ask which folder, or find it.

## Install: the MCP server

`@softeria/ms-365-mcp-server` — a Graph client with named mail tools. Register it, then have the
owner sign in once with a device code. No Azure portal, no client secret, no app registration.

```
claude mcp add outlook --scope user -- npx -y @softeria/ms-365-mcp-server \
  --preset mail --org-mode \
  --allowed-scopes "Mail.ReadWrite MailboxSettings.Read MailboxSettings.ReadWrite User.Read" \
  --expected-username them@company.com
```

- `--preset mail` cuts 200+ tools down to the mail ones.
- `--org-mode` is required for a work account.
- `--allowed-scopes` **drops `Mail.Send`**, which disables the five sending tools. A filing job has
  no business being able to send mail, and an IT department reading the consent screen will notice.
- `--expected-username` pins the mailbox. Use it. See "Pin the mailbox" below for why.

Sign in with `--login`, check with `--verify-login`. Both belong in a double-clickable `.cmd` if the
owner does not use a terminal; `scripts/` here has the three files used in the source run.

Four delegated permissions result: `Mail.ReadWrite`, `MailboxSettings.Read`,
`MailboxSettings.ReadWrite`, `User.Read`. Delegated means the connection can never reach past the
signed-in user's own mailbox. `MailboxSettings.*` is what inbox rules live under; without it the
rule tools silently do not appear.

**A newly registered MCP server does not load in the session that installed it.** Either restart, or
speak MCP over stdio from a script. `scripts/stdio.js` does the latter and is what made the source
run possible in one sitting.

## Pin the mailbox

The first sign-in in the source run landed on the IT department's shared mailbox, because that was
the account the browser offered. Nothing had been read yet, only `--verify-login`, which returns the
display name. Checking that one line before listing a single message is the difference between a
clean start and having quietly reorganised mail that colleagues depend on.

So: verify the account, show the owner the name that came back, and pin it with
`--expected-username` before any tool reads mail.

## The method

### 1. Learn the habits, do not invent them

Two signals, in this order of trust:

**Sender and domain habits.** For every folder, tally who sent the mail in it. A domain that lands
in one folder 86 times out of 89 is a rule you can trust more than any word. In the source run, 27
client domains and 37 individual people had a habit that clear. Thresholds that worked: at least 6
messages for a domain, at least 8 for a person, and at least 85 percent in one folder.

**Subject words.** Only where the sender says nothing. In the source mailbox 427 of 565 inbox
messages came from the owner's own colleagues, so the sender was useless for most of the inbox and
the project name at the front of the subject decided everything.

That second finding is worth stating plainly because it inverts the Gmail method: **in a work
mailbox the sender is usually a colleague and tells you nothing. The client or project named in the
subject is the real signal.** Whether that holds depends on the house writing style. Check before
assuming.

### 2. Order the rules, because mail matches more than one

A message reading "ClientA - conversion to TechB" is true for two rules. Decide the precedence
once and apply it everywhere:

1. Sender and domain rules first, so a client's mail lands in the client's folder whatever it says.
2. Client and project folders next.
3. Technology and generic folders last.
4. Closed-project folders never get a rule, only backlog matching. They are closed.

Every rule ends with stop-processing so the first match wins.

### 3. Read the bodies when the subject is silent

After sender and subject, the source run still had 83 messages placed nowhere: internal threads with
subjects like "tasks in the update window" or "columns in the faults table". Fetching `bodyPreview`
placed 78 of them in one pass, because the body names the server, the client or the project in the
first two lines. This step is cheap and it is what turns a 60 percent result into a 95 percent one.

### 4. Show the classification before running it

One file, three parts: the sender habits with their evidence counts, every unplaced message with the
folder chosen and the one-line reason, and any folder that would have to be created. The owner reads
it and corrects a handful of lines. In the source run they corrected exactly one out of 83, and
approved the rest in a sentence.

That correction rate is the argument for doing the reading properly rather than asking the owner to
classify. They asked for exactly this: *"you can do a fuller classification instead of asking me to
tell you how to classify."*

### 5. Sent Items is the same job with the signals inverted

The inbox is half the mail. Sent Items holds the other half of every thread, and filing it needs one
change that is easy to get wrong.

**In Sent Items the sender is always the owner, so every sender signal has to be read off the
recipients.** That part is obvious. The part that is not: **a colleague on the To or Cc line is not
what the message is about.** People copy their IT team and their office on project threads
constantly. In the source run, applying the colleague rules in their inbox order sent 92 project
threads into the IT folder and 71 into the office folder, including a public tender and a database
conversion. The subject had said plainly where each belonged.

So the order changes for sent mail:

1. The correspondent rules the owner gave by hand — these still beat the subject.
2. The subject. In sent mail this is the honest signal.
3. An outside correspondent whose mail they always file in one place.
4. Only last, a colleague, and only on the To line, never on Cc alone.

Sent Items in the source run went from 507 messages to 112 that way, with the IT folder taking the
19 that really were IT.

Two more things surface here that the inbox pass never exposed. **Substring matching bites**: a
keyword for one town matched a longer town name that contains it. A keyword should only count when
the word actually ends there; in Hebrew, prefixes attach at the front, so check the end of the word
and not the start. And **people spell their own projects several ways in their own subjects** — three
new spellings turned up in Sent Items for folders whose inbox rules had worked fine for months.

## Traps, each of which cost real time

**A rule with two kinds of condition ANDs them.** An inbox rule carrying both a sender list and a
subject list fires only when **both** match. The first 14 rules in the source run were built that
way and quietly did almost nothing: the client rule needed the client's address *and* the client's
name in the subject. Split them into two families, senders first, subjects second.

**Rules never touch existing mail.** Same as Gmail. Creating rules and expecting the inbox to empty
is the single most common misunderstanding. The backlog is a separate pass, message by message.

**Spelling variants.** Hebrew, and any language with more than one accepted transliteration, will
have the same word spelled two ways in real subjects. Two messages were missed over a single letter.
When a keyword misses, check the spelling before blaming the logic.

**The tool parameter shapes are not obvious.** In this server, folder-scoped calls want
`mailFolderId`, and both `move-mail-message` and `create-mail-rule` want their payload nested under
`body`. A wrong shape returns a validation error for every message and moves nothing, which looks
exactly like a permissions problem and is not.

**Exchange caps total rule size**, not count, at 256 KB. Dozens of rules are fine; hundreds of
one-sender rules are not. Group senders by destination folder, one rule per folder with a list.

**Never add a delete action.** The source mailbox already had three of the owner's own rules that
delete mail; those were left untouched and nothing new was given that power. Verify at the end that
the deleted-items count has not moved because of you.

## What always stays in the inbox

- One-time codes, password resets, sign-in links and security alerts. Someone hunting for a code is
  under time pressure and a folder does not help them.
- Anything that matches nothing. An unfiled message in the inbox is a smaller problem than a
  message filed into the wrong project, which is effectively lost.
- Threads whose project has no folder. Say so and let the owner decide; do not force the nearest fit.

The source run ended with five messages in the inbox: two passwords, two threads for a project with
no folder, and one line that named nothing. That is a correct ending, not an incomplete one.

## Reporting

Give counts read back from the mailbox, never from your own tally: inbox before and after, folder
counts, rule count, deleted-items count. In the source run the owner said twice that he saw no
movement, because his Outlook had not synced. Numbers pulled live from the server settled it.

## Files here

- `scripts/stdio.js` — speak MCP over stdio to the server, for when the tools are not loaded yet.
- `scripts/1-sign-in.cmd`, `scripts/2-verify.cmd`, `scripts/3-switch-account.cmd` — the owner's side,
  double-clickable.
- `references/rulebook-template.md` — the shape of a per-mailbox rulebook. It ships empty on purpose.
  A filled one names the owner's clients, colleagues and projects and belongs nowhere public.
