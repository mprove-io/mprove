import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class RunDashboardsCommand extends CustomCommand {
  static usage = Command.Usage({
    description: 'Run dashboards',
    examples: [['Run dashboards', 'mprove run dashboards']]
  });

  static paths = [['run', 'dashboards']];

  async execute() {
    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.config.mproveCliEmail,
      password: this.config.mproveCliPassword
    };

    let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      config: this.config
    });

    let getDashboardsReqPayload: apiToBackend.ToBackendGetDashboardsRequestPayload =
      {
        projectId: this.config.mproveCliProjectId,
        isRepoProd: common.enumToBoolean(this.config.mproveCliIsRepoProd),
        branchId: this.config.mproveCliBranchId,
        envId: this.config.mproveCliEnvId
      };

    let getDashboardsResp =
      await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
        config: this.config,
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
      config: this.config,
      token: loginUserResp.payload.token
    });

    // this.context.stdout.write(`${JSON.stringify(runQueriesResp, null, 2)}\n`);

    return 0;
  }
}
