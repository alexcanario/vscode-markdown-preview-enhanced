/**
 * Matches a GFM task list line: optional indent, a list marker
 * (`-`, `*`, `+`, `1.` or `1)`), whitespace, then the `[ ]` / `[x]` box.
 * Anchoring to the marker keeps a `[ ]` that is ordinary text untouched.
 */
const TASK_RE = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX])(\])/;

/**
 * Flip the checkbox of a task list line (`[ ]` <-> `[x]`).
 * Returns `null` when the line is not a task list item.
 */
export function toggleTaskLine(text: string): string | null {
  const match = TASK_RE.exec(text);
  if (!match) {
    return null;
  }
  const next = match[2] === ' ' ? 'x' : ' ';
  return match[1] + next + match[3] + text.slice(match[0].length);
}
