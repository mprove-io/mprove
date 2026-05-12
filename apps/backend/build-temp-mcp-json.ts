import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFullMcpJson } from '#backend/functions/build-full-mcp-json.ts';

let __dirname = dirname(fileURLToPath(import.meta.url));

let outPath = resolve(__dirname, '../../tmp/full-mcp.json');

let result = buildFullMcpJson();

await mkdir(dirname(outPath), { recursive: true });

await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`);

console.log(`wrote ${outPath}`);
console.log(`tools: ${result.tools.length}`);
console.log(`$defs: ${Object.keys(result.$defs).length}`);
