import * as vscode from 'vscode';

/**
 * Timing log for the slow first preview open. Writes to the
 * "CAS Markdown Studio: Performance" output channel; each line shows the
 * time since this module loaded (≈ when the extension bundle finished
 * evaluating) and how long the step took.
 */
const moduleLoadedAt = Date.now();
let channel: vscode.OutputChannel | undefined;

function getChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel(
      'CAS Markdown Studio: Performance',
    );
  }
  return channel;
}

/** Log `label` with the time elapsed since `startedAt` (from Date.now()). */
export function logTiming(label: string, startedAt: number): void {
  const now = Date.now();
  getChannel().appendLine(
    `[+${now - moduleLoadedAt} ms] ${label}: ${now - startedAt} ms`,
  );
}

/** Run `fn` and log how long it took, whether it resolves or throws. */
export async function timed<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  try {
    return await fn();
  } finally {
    logTiming(label, startedAt);
  }
}
