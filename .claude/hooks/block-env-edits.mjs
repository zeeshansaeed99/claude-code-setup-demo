// PreToolUse hook. Exit 2 blocks the tool call and sends the message back to Claude.
//   Edit / Write / MultiEdit: blocks writing to a real .env file (.env, .env.local, ...; not .env.example).
//   Bash: blocks commands that NAME a real .env file (e.g. `echo X >> .env`, `cat .env`, `sed -i .env`).
// Limits: a Bash command that reaches the file without naming it (a variable, a glob, a script
// that writes it) is not caught. This is a guard against accidents, not a security boundary.
import { basename } from 'node:path';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
const { tool_name: tool, tool_input: input = {} } = JSON.parse(raw);

const isRealEnv = name => name === '.env' || (name.startsWith('.env.') && name !== '.env.example');
const block = what => {
  console.error(`Blocked: ${what} touches a .env file, which holds secrets. Add new settings to .env.example instead.`);
  process.exit(2);
};

if (tool === 'Bash') {
  const names = (input.command ?? '').match(/(?:^|[\s'"=<>|;&/])(\.env(?:\.[\w-]+)?)(?=$|[\s'";|&)<>])/g) ?? [];
  if (names.some(m => isRealEnv(m.replace(/^[\s'"=<>|;&/]/, '')))) block('This command');
} else if (isRealEnv(basename(input.file_path ?? ''))) {
  block(basename(input.file_path));
}
