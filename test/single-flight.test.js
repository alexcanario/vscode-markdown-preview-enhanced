/* global suite, test, suiteSetup, suiteTeardown */

/**
 * Unit tests for src/single-flight.ts — the helper that makes concurrent
 * `getNotebook` calls for one root share a single Notebook initialization.
 *
 * Pure helper, no vscode runtime needed — compiled on the fly with esbuild
 * like the other helper tests.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

let SingleFlight;
let tmpFile;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

suite('SingleFlight', function () {
  this.timeout(15000);

  suiteSetup(async function () {
    const result = await esbuild.build({
      entryPoints: [path.join(__dirname, '..', 'src', 'single-flight.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      write: false,
      logLevel: 'silent',
    });
    tmpFile = path.join(__dirname, '.single-flight.bundle.cjs');
    fs.writeFileSync(tmpFile, result.outputFiles[0].text);
    SingleFlight = require(tmpFile).SingleFlight;
  });

  suiteTeardown(function () {
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  });

  test('concurrent calls for one key run the work once and share it', async function () {
    const flight = new SingleFlight();
    const gate = deferred();
    let runs = 0;
    const work = () => {
      runs++;
      return gate.promise;
    };
    const calls = [1, 2, 3, 4].map(() => flight.run('root', work));
    gate.resolve('notebook');
    const results = await Promise.all(calls);
    assert.strictEqual(runs, 1);
    assert.deepStrictEqual(results, [
      'notebook',
      'notebook',
      'notebook',
      'notebook',
    ]);
  });

  test('different keys run independently', async function () {
    const flight = new SingleFlight();
    let runs = 0;
    const work = async () => ++runs;
    await Promise.all([flight.run('a', work), flight.run('b', work)]);
    assert.strictEqual(runs, 2);
  });

  test('a call after the first settled starts fresh', async function () {
    const flight = new SingleFlight();
    let runs = 0;
    const work = async () => ++runs;
    assert.strictEqual(await flight.run('root', work), 1);
    assert.strictEqual(await flight.run('root', work), 2);
  });

  test('a failure reaches every waiting caller and is not cached', async function () {
    const flight = new SingleFlight();
    const gate = deferred();
    const first = flight.run('root', () => gate.promise);
    const second = flight.run('root', () => Promise.resolve('unused'));
    gate.reject(new Error('boom'));
    await assert.rejects(first, /boom/);
    await assert.rejects(second, /boom/);
    assert.strictEqual(
      await flight.run('root', async () => 'retried'),
      'retried',
    );
  });
});
