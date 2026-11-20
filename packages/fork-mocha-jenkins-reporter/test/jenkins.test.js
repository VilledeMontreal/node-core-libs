const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const Mocha = require('mocha');
const Jenkins = require('@villedemontreal/mocha-jenkins-reporter');

test('reports passing, failing and pending tests in JUnit XML', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jenkins-reporter-'));
  const reportPath = path.join(directory, 'report.xml');
  const mocha = new Mocha({
    reporter: Jenkins,
    reporterOptions: { junit_report_path: reportPath, junit_report_stack: true },
  });
  const suite = Mocha.Suite.create(mocha.suite, 'Compatibility');

  suite.addTest(new Mocha.Test('passes', () => console.log('captured output')));
  suite.addTest(new Mocha.Test('fails', () => assert.strictEqual('actual', 'expected')));
  suite.addTest(new Mocha.Test('pending'));

  try {
    const failures = await new Promise(resolve => mocha.run(resolve));
    const report = fs.readFileSync(reportPath, 'utf8');

    assert.strictEqual(failures, 1);
    assert.match(report, /tests="3"/);
    assert.match(report, /failures="1"/);
    assert.match(report, /skipped="1"/);
    assert.match(report, /name="passes"/);
    assert.match(report, /name="fails"/);
    assert.match(report, /name="pending"/);
    assert.match(report, /<failure/);
    assert.match(report, /<skipped/);
    assert.match(report, /captured output/);
    assert.match(report, /-actual/);
    assert.match(report, /\+expected/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});