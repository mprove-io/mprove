import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class RunDashboardsCommand extends CustomCommand {
  static usage = Command.Usage({
    description: 'Run dashboards',
    examples: [['Run dashboards', 'mprove run dashboards']]
  });

  static paths = [['run', 'dashboards']];

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
        projectId: this.context.config.mproveCliProjectId,
        isRepoProd: common.enumToBoolean(
          this.context.config.mproveCliIsRepoProd
        ),
        branchId: this.context.config.mproveCliBranchId,
        envId: this.context.config.mproveCliEnvId
      };

    let getDashboardsResp =
      await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
        config: this.context.config,
        token: loginUserResp.payload.token
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
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      config: this.context.config,
      token: loginUserResp.payload.token
    });

    // this.context.stdout.write(`${JSON.stringify(runQueriesResp, null, 2)}\n`);

    console.log(
      `Quries running: ${runQueriesResp.payload.runningQueries.length}`
    );
  }
}
