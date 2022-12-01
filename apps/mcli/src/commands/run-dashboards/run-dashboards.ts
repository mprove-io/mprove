import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { mreq } from '~mcli/functions/mreq';

export class RunDashboardsCommand extends Command {
  static usage = Command.Usage({
    description: 'Run dashboards',
    examples: [['Run dashboards', 'mprove run dashboards']]
  });

  static paths = [['run', 'dashboards']];

  async execute() {
    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: process.env.MPROVE_CLI_LOGIN,
      password: process.env.MPROVE_CLI_PASSWORD
    };

    let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload
    });

    let getDashboardsReqPayload: apiToBackend.ToBackendGetDashboardsRequestPayload =
      {
        projectId: process.env.MPROVE_CLI_PROJECT_ID,
        isRepoProd: common.enumToBoolean(
          process.env.MPROVE_CLI_IS_REPO_PROD as common.BoolEnum
        ),
        branchId: process.env.MPROVE_CLI_BRANCH_ID,
        envId: process.env.MPROVE_CLI_ENV_ID
      };

    let getDashboardsResp =
      await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
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
      token: loginUserResp.payload.token
    });

    // this.context.stdout.write(`${JSON.stringify(runQueriesResp, null, 2)}\n`);

    return 0;
  }
}
