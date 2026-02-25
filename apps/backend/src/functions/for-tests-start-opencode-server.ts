import crypto from 'node:crypto';
import { createOpencodeClient, type OpencodeClient } from '@opencode-ai/sdk/v2';
import type { Sandbox } from 'e2b';

export async function forTestsStartOpencodeServer(item: {
  sandbox: Sandbox;
  cwd: string;
}): Promise<{ baseUrl: string; password: string; client: OpencodeClient }> {
  let password = crypto.randomBytes(32).toString('hex');

  let cmd = `cd ${item.cwd} && opencode serve --port 3000`;

  await item.sandbox.commands.run(cmd, {
    background: true,
    timeoutMs: 0,
    envs: { OPENCODE_SERVER_PASSWORD: password }
  });

  let host = item.sandbox.getHost(3000);
  let baseUrl = `https://${host}`;

  let serverReady = false;

  for (let i = 0; i < 30; i++) {
    try {
      let res = await fetch(`${baseUrl}/config`);
      if (res.status === 401) {
        serverReady = true;
        break;
      }
    } catch {
      // retry
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!serverReady) {
    throw new Error('opencode server did not become ready');
  }

  let client = createOpencodeClient({
    baseUrl,
    directory: item.cwd,
    headers: {
      Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`
    }
  });

  return { baseUrl, password, client };
}
