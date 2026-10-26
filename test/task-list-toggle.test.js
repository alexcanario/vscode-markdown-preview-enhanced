/* global suite, test, suiteSetup, suiteTeardown */

/**
 * Unit tests for src/task-list-toggle.ts.
 *
 * Pure helper, no vscode runtime needed — compiled on the fly with esbuild
 * like the other helper tests.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

let toggleTaskLine;
let tmpFile;

suite('toggleTaskLine', function () {
  this.timeout(15000);

  suiteSetup(async function () {
    const result = await esbuild.build({
      entryPoints: [path.join(__dirname, '..', 'src', 'task-list-toggle.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      write: false,
      logLevel: 'silent',
    });
    tmpFile = path.join(__dirname, '.task-list-toggle.bundle.cjs');
    fs.writeFileSync(tmpFile, result.outputFiles[0].text);
    toggleTaskLine = require(tmpFile).toggleTaskLine;
  });

  suiteTeardown(function () {
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  });

  test('checks an unchecked item', function () {
    assert.strictEqual(toggleTaskLine('- [ ] buy milk'), '- [x] buy milk');
  });

  test('unchecks a checked item, lower and upper case', function () {
    assert.strictEqual(toggleTaskLine('- [x] done'), '- [ ] done');
    assert.strictEqual(toggleTaskLine('- [X] done'), '- [ ] done');
  });

  test('supports -, *, + and ordered markers', function () {
    assert.strictEqual(toggleTaskLine('* [ ] a'), '* [x] a');
    assert.strictEqual(toggleTaskLine('+ [ ] a'), '+ [x] a');
    assert.strictEqual(toggleTaskLine('1. [ ] a'), '1. [x] a');
    assert.strictEqual(toggleTaskLine('12) [x] a'), '12) [ ] a');
  });

  test('keeps indentation for nested items', function () {
    assert.strictEqual(toggleTaskLine('    - [ ] nested'), '    - [x] nested');
    assert.strictEqual(toggleTaskLine('\t- [x] nested'), '\t- [ ] nested');
  });

  test('only changes the task box, not later brackets', function () {
    assert.strictEqual(
      toggleTaskLine('- [ ] see [ ] and [x]'),
      '- [x] see [ ] and [x]',
    );
  });

  test('keeps a trailing CR', function () {
    assert.strictEqual(toggleTaskLine('- [ ] a\r'), '- [x] a\r');
  });

  test('returns null for non-task lines', function () {
    assert.strictEqual(toggleTaskLine('- plain item'), null);
    assert.strictEqual(toggleTaskLine('text [ ] not a task'), null);
    assert.strictEqual(toggleTaskLine('[ ] no marker'), null);
    assert.strictEqual(toggleTaskLine('- [] empty box'), null);
    assert.strictEqual(toggleTaskLine('- [-] other state'), null);
    assert.strictEqual(toggleTaskLine(''), null);
  });
});
