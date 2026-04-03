import { Injectable } from '@nestjs/common';
import { Sandbox } from 'e2b';

const CODEX_AUTH_JSON_PATH = '/home/user/.local/share/opencode/auth.json';

@Injectable()
export class EditorCodexService {
  getAuthJsonPath(): string {
    return CODEX_AUTH_JSON_PATH;
  }

  buildCodexAuthFile(item: { codexAuthJson: string }): {
    path: string;
    data: string;
  } {
    let { codexAuthJson } = item;

    return {
      path: CODEX_AUTH_JSON_PATH,
      data: codexAuthJson
    };
  }

  async writeAuthJsonToSandbox(item: {
    sandboxId: string;
    e2bApiKey: string;
    authJsonContent: string;
  }): Promise<void> {
    let { sandboxId, e2bApiKey, authJsonContent } = item;

    let dirPath = CODEX_AUTH_JSON_PATH.substring(
      0,
      CODEX_AUTH_JSON_PATH.lastIndexOf('/')
    );

    let sandbox = await Sandbox.connect(sandboxId, { apiKey: e2bApiKey });

    await sandbox.commands.run(`mkdir -p ${dirPath}`);
    await sandbox.files.write(CODEX_AUTH_JSON_PATH, authJsonContent);
    await sandbox.commands.run(`chmod 600 ${CODEX_AUTH_JSON_PATH}`);
  }

  parseJwtExp(item: { token: string }): number | undefined {
    let { token } = item;

    let parts = token.split('.');

    if (parts.length !== 3) {
      return undefined;
    }

    try {
      let payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      let exp = payload?.exp;

      if (typeof exp === 'number') {
        return exp * 1000;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}
