// PreToolUse hook: refuse any edit to a real .env file. Exit 2 blocks the tool call
// and the stderr message goes back to Claude so it can change course.
import { basename } from 'node:path';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
const filePath = JSON.parse(raw).tool_input?.file_path ?? '';
const name = basename(filePath);

if (name === '.env' || (name.startsWith('.env.') && name !== '.env.example')) {
  console.error(`Blocked: ${name} holds secrets and must not be edited by Claude. Add the setting to .env.example instead.`);
  process.exit(2);
}
