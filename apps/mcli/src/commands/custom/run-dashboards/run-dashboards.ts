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
      ],
      [
        'Run dashboards d1 and d2 for Personal Dev repo',
        'mprove run dashboards -p DXYE72ODCP5LWPWH2EXQ -b main -e prod --dashboardIds d1,d2'
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

  dashboardIds = Option.String(`--dashboardIds`, {
    description: `(optional) Run only dashboards with selected Ids (dashboard names), separated by comma`
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

    let ids = this.dashboardIds?.split(',');

    if (common.isDefined(ids)) {
      ids.forEach(x => {
        if (
          getDashboardsResp.payload.dashboards
            .map(dashboard => dashboard.dashboardId)
            .indexOf(x) < 0
        ) {
          let serverError = new common.ServerError({
            message: common.ErEnum.MCLI_DASHBOARD_NOT_FOUND,
            data: { id: x },
            originalError: null
          });
          throw serverError;
        }
      });
    }

    let queryIdsWithDuplicates: string[] = [];

    getDashboardsResp.payload.dashboards
      .filter(
        dashboard =>
          common.isUndefined(ids) || ids.indexOf(dashboard.dashboardId) > -1
      )
      .forEach(dashboard => {
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
      log: `Queries running: ${runQueriesResp.payload.runningQueries.length}`,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: false
    });
  }
}
