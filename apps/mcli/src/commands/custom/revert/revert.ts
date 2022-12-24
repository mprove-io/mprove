import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export enum ToEnum {
  Remote = 'remote',
  LastCommit = 'last-commit'
}

export class RevertCommand extends CustomCommand {
  static paths = [['revert']];

  static usage = Command.Usage({
    description:
      'Revert (reset) repo to the state of a last commit or Remote repo, validate BlockML for selected env',
    examples: [
      [
        'Revert Dev repo to the state of Remote repo, validate BlockML for env prod',
        'mprove revert --to remote --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ],
      [
        'Revert Production repo to the state of a last commit, validate BlockML for env prod',
        'mprove revert --to last-commit --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ]
    ]
  });

  to = Option.String('--to', {
    required: true,
    validator: t.isEnum(ToEnum),
    description: `(required, "${ToEnum.LastCommit}" or "${ToEnum.Remote}")`
  });

  projectId = Option.String('--project-id', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description: `(required, "${enums.RepoEnum.Dev}" or "${enums.RepoEnum.Production}")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let resp:
      | apiToBackend.ToBackendRevertRepoToLastCommitResponse
      | apiToBackend.ToBackendRevertRepoToRemoteResponse;

    if (this.to === ToEnum.LastCommit) {
      let revertRepoToLastCommitReqPayload: apiToBackend.ToBackendRevertRepoToLastCommitRequestPayload =
        {
          projectId: this.projectId,
          isRepoProd: isRepoProd,
          branchId: this.branch,
          envId: this.env
        };

      resp = await mreq<apiToBackend.ToBackendRevertRepoToLastCommitResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendRevertRepoToLastCommit,
        payload: revertRepoToLastCommitReqPayload,
        host: this.context.config.mproveCliHost
      });
    } else {
      let revertRepoToRemoteReqPayload: apiToBackend.ToBackendRevertRepoToRemoteRequestPayload =
        {
          projectId: this.projectId,
          isRepoProd: isRepoProd,
          branchId: this.branch,
          envId: this.env
        };

      resp = await mreq<apiToBackend.ToBackendRevertRepoToRemoteResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote,
        payload: revertRepoToRemoteReqPayload,
        host: this.context.config.mproveCliHost
      });
    }

    let log: any = {
      errorsTotal: resp.payload.struct.errors.length
    };

    if (this.getErrors === true) {
      log.errors = resp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
