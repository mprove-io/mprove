import { homedir } from 'node:os';
import path from 'node:path';
import { Command, Option } from 'clipanion';
import fse from 'fs-extra';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendSetUserCodexAuthRequestPayload,
  ToBackendSetUserCodexAuthResponse
} from '#common/interfaces/to-backend/users/to-backend-set-user-codex-auth';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class SetCodexAuthCommand extends CustomCommand {
  static paths = [['set-codex-auth']];

  static usage = Command.Usage({
    description: 'Set Codex auth from local opencode auth.json file',
    examples: [
      [
        'Set Codex auth using default auth.json location',
        'mprove set-codex-auth'
      ],
      [
        'Set Codex auth using custom auth.json path',
        'mprove set-codex-auth --auth-file-path /path/to/auth.json'
      ]
    ]
  });

  authFilePath = Option.String('--auth-file-path', {
    description:
      '(optional) Path to opencode auth.json file, defaults to ~/.local/share/opencode/auth.json'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let resolvedAuthFilePath = isUndefined(this.authFilePath)
      ? path.join(homedir(), '.local', 'share', 'opencode', 'auth.json')
      : this.authFilePath;

    let isFileExist = fse.pathExistsSync(resolvedAuthFilePath);

    if (isFileExist === false) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_CODEX_AUTH_FILE_NOT_FOUND,
        originalError: null
      });
      throw serverError;
    }

    let fileContent = fse.readFileSync(resolvedAuthFilePath).toString();

    let parsed: any;
    try {
      parsed = JSON.parse(fileContent);
    } catch {
      throw new ServerError({
        message: ErEnum.MCLI_CODEX_AUTH_JSON_PARSE_FAILED,
        originalError: null
      });
    }

    let authJson = JSON.stringify({ openai: parsed.openai });

    let payload: ToBackendSetUserCodexAuthRequestPayload = {
      authJson: authJson
    };

    let resp = await mreq<ToBackendSetUserCodexAuthResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth,
      payload: payload,
      host: this.context.config.mproveCliHost
    });

    let user = resp.payload.user;

    let log = {
      isCodexAuthSet: user.isCodexAuthSet,
      codexAuthUpdateTs: user.codexAuthUpdateTs,
      codexAuthExpiresTs: user.codexAuthExpiresTs,
      codexAuthRefreshTs: user.codexAuthRefreshTs
    };

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
