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

export class RevertRepoCommand extends CustomCommand {
  static paths = [['revert', 'repo']];

  static usage = Command.Usage({
    description:
      'Revert repo to the state of a last commit or Remote repo, validate BlockML for selected env',
    examples: [
      [
        'Revert Production repo to the state of a last commit, validate BlockML for env prod',
        'mprove revert repo --to last-commit --projectId DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ],
      [
        'Revert Dev repo to the state of Remote repo, validate BlockML for env prod',
        'mprove revert repo --to remote --projectId DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ]
    ]
  });

  to = Option.String('--to', {
    required: true,
    validator: t.isEnum(ToEnum),
    description: `(required, "${ToEnum.LastCommit}" or "${ToEnum.Remote}")`
  });

  project = Option.String('--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description: `(required, "${enums.RepoEnum.Dev}" or "${enums.RepoEnum.Production}")`
  });

  branchId = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  verbose = Option.Boolean('--verbose', false, {
    description: '(default false)'
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
          projectId: this.project,
          isRepoProd: isRepoProd,
          branchId: this.branchId,
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
          projectId: this.project,
          isRepoProd: isRepoProd,
          branchId: this.branchId,
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
      struct: {
        errorsTotal: resp.payload.struct.errors.length
      }
    };

    if (this.verbose === true) {
      log.struct.errors = resp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
