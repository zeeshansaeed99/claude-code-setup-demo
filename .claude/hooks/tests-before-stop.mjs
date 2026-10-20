// Stop hook: if source or test files changed, run the test suite before Claude may finish.
// Exit 2 keeps Claude working and shows it the failures.
import { execSync } from 'node:child_process';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
if (JSON.parse(raw || '{}').stop_hook_active) process.exit(0); // already retried once; don't loop

const changed = execSync('git status --porcelain -- src test', { encoding: 'utf8' }).trim();
if (!changed) process.exit(0);

try {
  execSync('npm test', { stdio: 'pipe', encoding: 'utf8' });
} catch (err) {
  const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.split('\n').slice(-40).join('\n');
  console.error(`Tests fail after your changes. Fix them before finishing.\n\n${out}`);
  process.exit(2);
}
