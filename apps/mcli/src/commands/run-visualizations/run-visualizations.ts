import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { mreq } from '~mcli/functions/mreq';

export class RunVisualizationsCommand extends Command {
  static usage = Command.Usage({
    description: 'Run visualizations',
    examples: [['Run visualizations', 'mprove run visualizations']]
  });

  static paths = [['run', 'visualizations']];

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

    let getVizsReqPayload: apiToBackend.ToBackendGetVizsRequestPayload = {
      projectId: process.env.MPROVE_CLI_PROJECT_ID,
      isRepoProd: common.enumToBoolean(
        process.env.MPROVE_CLI_IS_REPO_PROD as common.BoolEnum
      ),
      branchId: process.env.MPROVE_CLI_BRANCH_ID,
      envId: process.env.MPROVE_CLI_ENV_ID
    };

    let getVizsResp = await mreq<apiToBackend.ToBackendGetVizsResponse>({
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
      payload: getVizsReqPayload,
      token: loginUserResp.payload.token
    });

    let queryIdsWithDuplicates = getVizsResp.payload.vizs.map(
      x => x.reports[0].queryId
    );

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
