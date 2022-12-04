import { Command, Option } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class RunDashboardsCommand extends CustomCommand {
  static paths = [['run', 'dashboards']];

  static usage = Command.Usage({
    description: 'Run dashboards',
    examples: [
      [
        'Run dashboards for Production repo',
        'mprove run dashboards -p DXYE72ODCP5LWPWH2EXQ --production -b main -e prod'
      ],
      [
        'Run dashboards for Personal Dev repo',
        'mprove run dashboards -p DXYE72ODCP5LWPWH2EXQ -b main -e prod'
      ]
    ]
  });

  projectId = Option.String(`-p,--projectId`, {
    required: true,
    description: '(required) Project Id'
  });

  isRepoProd = Option.Boolean(`--production`, false, {
    description: `(default false) If flag is set, then Production repo will be used, otherwise Personal Dev repo`
  });

  branchId = Option.String(`-b,--branchId`, {
    required: true,
    description: '(required) Branch Id'
  });

  envId = Option.String(`-e,--envId`, {
    required: true,
    description: '(required) Environment Id'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.context.config.mproveCliEmail,
      password: this.context.config.mproveCliPassword
    };

    let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      config: this.context.config
    });

    let getDashboardsReqPayload: apiToBackend.ToBackendGetDashboardsRequestPayload =
      {
        projectId: this.projectId,
        isRepoProd: this.isRepoProd,
        branchId: this.branchId,
        envId: this.envId
      };

    let getDashboardsResp =
      await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
        token: loginUserResp.payload.token,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
        config: this.context.config
      });

    let queryIdsWithDuplicates: string[] = [];

    getDashboardsResp.payload.dashboards.forEach(dashboard => {
      dashboard.reports.forEach(report => {
        queryIdsWithDuplicates.push(report.queryId);
      });
    });

    let uniqueQueryIds = [...new Set(queryIdsWithDuplicates)];

    let runQueriesReqPayload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      queryIds: uniqueQueryIds
    };

    let runQueriesResp = await mreq<apiToBackend.ToBackendRunQueriesResponse>({
      token: loginUserResp.payload.token,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      config: this.context.config
    });

    logToConsoleMcli({
      log: `Queries running: ${runQueriesResp.payload.runningQueries.length}\n`,
      logLevel: common.LogLevelEnum.Info,
      context: this.context
    });
  }
}
