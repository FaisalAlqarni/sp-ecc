---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in small sections (200-300 words), checking after each section whether it looks right so far.

## The Process

**Understanding the idea:**
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**
- Once you believe you understand what you're building, present the design
- Break it into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Use the bundled `./writing-clearly-and-concisely.md` skill to polish the design doc prose
- Commit the design document to git

**Next steps — present exactly these 4 options:**

```
Design complete. What would you like to do?

1. Ready — proceed to implementation
2. Revise — continue brainstorming (new idea or change)
3. Save & exit — keep design doc, come back later
4. Discard & start fresh — drop design, new brainstorm

Which option?
```

**If option 1 (Ready):**
- Ask workspace preference:
  ```
  How would you like to set up the workspace?

  1. Create an isolated worktree (recommended for larger features)
  2. Work directly on a new branch
  ```
- If worktree: Use sp-ecc:using-git-worktrees to create isolated workspace
- If direct branch: Create a new branch from current HEAD
- Then use sp-ecc:writing-plans to create detailed implementation plan

**If option 2 (Revise):**
- Ask what the user wants to change or explore
- Loop back to the appropriate phase (understanding, approaches, or design)

**If option 3 (Save & exit):**
- Confirm design doc is saved and committed
- Report: "Design saved to `docs/plans/<filename>`. You can resume implementation later by running `/sp-ecc:write-plan` with this design doc."

**If option 4 (Discard & start fresh):**
- Confirm: "This will discard the current design. Are you sure?"
- If confirmed: Start over from Phase 1

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense
