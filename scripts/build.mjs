import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist');
const pages = [
  'index.html',
  'catalogo.html',
  'checkout.html',
  'produto.html',
  'sobre.html',
  'minha-conta.html',
];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const page of pages) {
  cpSync(resolve(root, page), resolve(output, page));
}
cpSync(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
cpSync(resolve(root, 'admin'), resolve(output, 'admin'), { recursive: true });
mkdirSync(resolve(output, 'assets/css'), { recursive: true });

execFileSync(process.execPath, [
  resolve(root, 'node_modules/tailwindcss/lib/cli.js'),
  '--config', resolve(root, 'assets/js/tailwind.config.js'),
  '--input', resolve(root, 'assets/css/tailwind.input.css'),
  '--output', resolve(output, 'assets/css/tailwind.css'),
  '--minify',
], { stdio: 'inherit' });

console.log(`Static site built in ${output}`);