import { Injectable } from '@nestjs/common';
import { Sandbox } from 'e2b';
import { CodexAuth } from '#common/interfaces/backend/codex-auth';

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

  async readAuthJsonFromSandbox(item: {
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<string | undefined> {
    let { sandboxId, e2bApiKey } = item;

    try {
      let sandbox = await Sandbox.connect(sandboxId, { apiKey: e2bApiKey });
      let content = await sandbox.files.read(CODEX_AUTH_JSON_PATH);
      return content;
    } catch {
      return undefined;
    }
  }

  parseCodexAuthJson(item: { authJsonContent: string }): CodexAuth | undefined {
    let { authJsonContent } = item;

    try {
      let parsed = JSON.parse(authJsonContent);
      let openaiAuth = parsed?.openai;

      if (!openaiAuth || openaiAuth.type !== 'oauth') {
        return undefined;
      }

      let refresh = openaiAuth.refresh;
      if (!refresh || typeof refresh !== 'string') {
        return undefined;
      }

      let expires = openaiAuth.expires;
      if (typeof expires !== 'number') {
        return undefined;
      }

      let accountId: string =
        typeof openaiAuth.accountId === 'string'
          ? openaiAuth.accountId
          : undefined;

      let access: string =
        typeof openaiAuth.access === 'string' ? openaiAuth.access : '';

      return {
        openai: {
          type: 'oauth',
          refresh: refresh,
          expires: expires,
          access: access,
          accountId: accountId
        }
      };
    } catch {
      return undefined;
    }
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
