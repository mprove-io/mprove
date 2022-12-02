import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { getConfig } from '~mcli/config/get.config';
import { mreq } from '~mcli/functions/mreq';

export class RunVisualizationsCommand extends Command {
  static usage = Command.Usage({
    description: 'Run visualizations',
    examples: [['Run visualizations', 'mprove run visualizations']]
  });

  static paths = [['run', 'visualizations']];

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

    let getVizsReqPayload: apiToBackend.ToBackendGetVizsRequestPayload = {
      projectId: config.mproveCliProjectId,
      isRepoProd: common.enumToBoolean(config.mproveCliIsRepoProd),
      branchId: config.mproveCliBranchId,
      envId: config.mproveCliEnvId
    };

    let getVizsResp = await mreq<apiToBackend.ToBackendGetVizsResponse>({
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
      payload: getVizsReqPayload,
      config: config,
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
      config: config,
      token: loginUserResp.payload.token
    });

    // this.context.stdout.write(`${JSON.stringify(runQueriesResp, null, 2)}\n`);

    return 0;
  }
}
