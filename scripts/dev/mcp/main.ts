import { styleText } from 'node:util';

const terminalColorValues = [
  'cyan',
  'green',
  'yellow',
  'dim',
  'magenta',
  'gray'
] as const;

export type TerminalColor = (typeof terminalColorValues)[number];

let toolNames: string[] = [
  'run',
  'get-state',
  'get-model',
  'get-query-info',
  'validate',
  'get-sample',
  'get-schemas',
  'get-connections-list',
  'get-skills',
  'read-docs',
  'list-docs',
  'search-docs'
];

async function main(item: { args: string[] }): Promise<void> {
  let { args } = item;

  let command: string = args[0] ?? '';

  if (command === '' || command === '--help' || command === '-h') {
    let toolList: string = toolNames.join(', ');

    console.log(`Usage: pnpm mcp <command> [json-arguments]

Protocol commands: initialize, list-tools
Tool commands: ${toolList}

Examples:
  pnpm mcp list-tools
  pnpm mcp list-docs
  pnpm mcp search-docs '{"query":"models"}'

Environment:
  MPROVE_CLI_API_KEY   Required Mprove API key
  MPROVE_CLI_HOST      Default: http://localhost:3000
  MPROVE_MCP_TIMEOUT   Timeout in seconds; default: 60
  NO_COLOR            Disable terminal syntax highlighting

Responses are printed without test assertions.
run executes data warehouse queries; validate rebuilds project files.`);

    return;
  }

  if (args.length > 2) {
    throw new Error('Usage: pnpm mcp <command> [json-arguments]');
  }

  if (
    command !== 'initialize' &&
    command !== 'list-tools' &&
    !toolNames.includes(command)
  ) {
    throw new Error(`Unknown command: ${command}. Run pnpm mcp --help.`);
  }

  let toolArguments: unknown = JSON.parse(args[1] ?? '{}');

  if (
    typeof toolArguments !== 'object' ||
    toolArguments === null ||
    Array.isArray(toolArguments)
  ) {
    throw new Error('Arguments must be a JSON object.');
  }

  if (
    (command === 'initialize' || command === 'list-tools') &&
    args.length === 2
  ) {
    throw new Error(`${command} does not accept JSON arguments.`);
  }

  let apiKey: string = process.env.MPROVE_CLI_API_KEY ?? '';

  if (apiKey === '') {
    throw new Error('Set MPROVE_CLI_API_KEY to your Mprove API key.');
  }

  let host: string = process.env.MPROVE_CLI_HOST ?? 'http://localhost:3000';

  let baseUrl: string = host.replace(/\/+$/, '');

  let timeoutSeconds: number = Number(process.env.MPROVE_MCP_TIMEOUT ?? '60');

  if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
    throw new Error('MPROVE_MCP_TIMEOUT must be a positive number of seconds.');
  }

  let timeoutMs: number = Math.ceil(timeoutSeconds * 1000);

  let method: string = 'tools/call';

  let params: Record<string, unknown> = {
    name: command,
    arguments: toolArguments
  };

  if (command === 'initialize') {
    method = 'initialize';

    params = {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: {
        name: 'mprove-mcp-script',
        version: '1.0.0'
      }
    };
  } else if (command === 'list-tools') {
    method = 'tools/list';

    params = {};
  }

  let body: string = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: method,
    params: params
  });

  // Mprove uses stateless HTTP with JSON responses; no session ID is needed.
  let response: Response = await fetch(`${baseUrl}/api/mcp`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-03-26'
    },
    body: body,
    signal: AbortSignal.timeout(timeoutMs)
  });

  let responseText: string = await response.text();

  if (!response.ok) {
    console.error(responseText);

    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  try {
    let responseValue: unknown = JSON.parse(responseText);

    let formattedResponse: string = JSON.stringify(responseValue, null, 2);

    let isColoredOutput: boolean =
      Boolean(process.stdout.isTTY) &&
      process.env.NO_COLOR === undefined &&
      process.env.TERM !== 'dumb';

    let output: string = isColoredOutput
      ? formattedResponse.replace(
          /"(?:\\.|[^"\\])*"(?:\s*:)?|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b|[{}\[\],:]/g,
          token => {
            let color: TerminalColor = token.startsWith('"')
              ? token.endsWith(':')
                ? 'cyan'
                : 'green'
              : token === 'true' || token === 'false'
                ? 'yellow'
                : token === 'null'
                  ? 'dim'
                  : /^-?\d/.test(token)
                    ? 'magenta'
                    : 'gray';

            let coloredToken: string = styleText(color, token);

            return coloredToken;
          }
        )
      : formattedResponse;

    console.log(output);
  } catch {
    console.log(responseText);
  }
}

let args: string[] = process.argv.slice(2);

main({ args: args }).catch((error: unknown) => {
  let message: string = error instanceof Error ? error.message : String(error);

  console.error(message);

  process.exitCode = 1;
});
