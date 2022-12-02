import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { getConfig } from '~mcli/config/get.config';
import { mreq } from '~mcli/functions/mreq';

export class RunDashboardsCommand extends Command {
  static usage = Command.Usage({
    description: 'Run dashboards',
    examples: [['Run dashboards', 'mprove run dashboards']]
  });

  static paths = [['run', 'dashboards']];

  async execute() {
    let config: interfaces.Config = getConfig();

    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: config.mproveCliEmail,
      password: config.mproveCliPassword
    };

    let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      config: config
    });

    let getDashboardsReqPayload: apiToBackend.ToBackendGetDashboardsRequestPayload =
      {
        projectId: config.mproveCliProjectId,
        isRepoProd: common.enumToBoolean(config.mproveCliIsRepoProd),
        branchId: config.mproveCliBranchId,
        envId: config.mproveCliEnvId
      };

    let getDashboardsResp =
      await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
        config: config,
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
      config: config,
      token: loginUserResp.payload.token
    });

    // this.context.stdout.write(`${JSON.stringify(runQueriesResp, null, 2)}\n`);

    return 0;
  }
}
