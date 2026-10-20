// Stop hook: run the test suite every time Claude tries to finish (it takes well under a second).
//   pass                 -> exit 0, and tell the user "Tests passed".
//   fail, first attempt  -> exit 2: Claude is sent back with the failures and must keep working.
//   fail, after a retry  -> exit 0 so Claude can stop (no infinite loop), but the user sees an
//                           explicit UNRESOLVED message. The task is then NOT verified as complete.
import { execSync } from 'node:child_process';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
const retry = Boolean(JSON.parse(raw || '{}').stop_hook_active);

let output = '';
let passed = true;
try {
  output = execSync('npm test', { stdio: 'pipe', encoding: 'utf8' });
} catch (err) {
  passed = false;
  output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
}
const summary = output.split('\n').filter(l => /^ℹ (tests|pass|fail) /.test(l)).map(l => l.slice(2)).join(', ');
const tail = output.split('\n').slice(-40).join('\n');

if (passed) {
  console.log(JSON.stringify({ systemMessage: `Tests passed (${summary}).` }));
  process.exit(0);
}
if (!retry) {
  console.error(`Tests fail. Fix them before finishing.\n\n${tail}`);
  process.exit(2);
}
console.log(JSON.stringify({
  systemMessage: `UNRESOLVED: tests still fail after a retry (${summary}). This task is NOT verified as complete.`,
}));
process.exit(0);
