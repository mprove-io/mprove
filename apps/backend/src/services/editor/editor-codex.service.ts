import { Injectable } from '@nestjs/common';
import { Sandbox } from 'e2b';
import type { CodexAuth } from '#common/zod/backend/codex-auth';

const CODEX_AUTH_JSON_PATH = '/home/user/.local/share/opencode/auth.json';

@Injectable()
export class EditorCodexService {
  getAuthJsonPath(): string {
    return CODEX_AUTH_JSON_PATH;
  }

  buildCodexAuthFile(item: { codexAuth: CodexAuth }): {
    path: string;
    data: string;
  } {
    let { codexAuth } = item;

    return {
      path: CODEX_AUTH_JSON_PATH,
      data: JSON.stringify(codexAuth)
    };
  }

  async writeAuthJsonToSandbox(item: {
    sandboxId: string;
    e2bApiKey: string;
    codexAuth: CodexAuth;
  }): Promise<void> {
    let { sandboxId, e2bApiKey, codexAuth } = item;

    let dirPath = CODEX_AUTH_JSON_PATH.substring(
      0,
      CODEX_AUTH_JSON_PATH.lastIndexOf('/')
    );

    let sandbox = await Sandbox.connect(sandboxId, { apiKey: e2bApiKey });

    await sandbox.commands.run(`mkdir -p ${dirPath}`);
    await sandbox.files.write(CODEX_AUTH_JSON_PATH, JSON.stringify(codexAuth));
    await sandbox.commands.run(`chmod 600 ${CODEX_AUTH_JSON_PATH}`);
  }
}
