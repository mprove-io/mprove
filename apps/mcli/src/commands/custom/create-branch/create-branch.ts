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

export class CreateBranchCommand extends CustomCommand {
  static paths = [['create-branch']];

  static usage = Command.Usage({
    description: 'Create git branch',
    examples: [
      [
        'Create git branch for Production repo',
        'mprove create-branch -p DXYE72ODCP5LWPWH2EXQ --repo production --new-branch n1 --from-branch main'
      ],
      [
        'Create git branch for Dev repo',
        'mprove create-branch -p DXYE72ODCP5LWPWH2EXQ --repo dev --new-branch n1 --from-branch main'
      ]
    ]
  });

  projectId = Option.String('-p', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description: `(required, "${enums.RepoEnum.Dev}" or "${enums.RepoEnum.Production}")`
  });

  newBranch = Option.String('--new-branch', {
    required: true,
    description: '(required) New Branch name'
  });

  fromBranch = Option.String('--from-branch', {
    required: true,
    description: '(required) From Branch name'
  });

  // verbose = Option.Boolean('--verbose', false, {
  //   description: '(default false)'
  // });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let validateFilesReqPayload: apiToBackend.ToBackendCreateBranchRequestPayload =
      {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        newBranchId: this.newBranch,
        fromBranchId: this.fromBranch
      };

    let validateFilesResp =
      await mreq<apiToBackend.ToBackendCreateBranchResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: validateFilesReqPayload,
        host: this.context.config.mproveCliHost
      });

    let log: any = {
      message: `Created branch "${this.newBranch}"`
    };

    // if (this.verbose === true) {
    //   log.struct.errors = validateFilesResp.payload.struct.errors;
    // }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
