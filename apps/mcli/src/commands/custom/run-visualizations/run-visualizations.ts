import { Command, Option } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class RunVisualizationsCommand extends CustomCommand {
  static paths = [['run', 'visualizations']];

  static usage = Command.Usage({
    description: 'Run visualizations',
    examples: [
      [
        'Run visualizations for Production repo',
        'mprove run visualizations -p DXYE72ODCP5LWPWH2EXQ --production -b main -e prod'
      ],
      [
        'Run visualizations for Personal Dev repo',
        'mprove run visualizations -p DXYE72ODCP5LWPWH2EXQ -b main -e prod'
      ],
      [
        'Run visualizations vis1 and vis2 for Personal Dev repo',
        'mprove run visualizations -p DXYE72ODCP5LWPWH2EXQ -b main -e prod --visualizationIds vis1,vis2'
      ]
    ]
  });

  projectId = Option.String('-p,--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  isRepoProd = Option.Boolean('--production', false, {
    description:
      '(default false) If flag is set, then Production repo will be used, otherwise Personal Dev repo'
  });

  branchId = Option.String('-b,--branchId', {
    required: true,
    description: '(required) Branch Id'
  });

  envId = Option.String('-e,--envId', {
    required: true,
    description: '(required) Environment Id'
  });

  visualizationIds = Option.String('--visualizationIds', {
    description:
      '(optional) Run only visualizations with selected Ids (visualization names), separated by comma'
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

    let getVizsReqPayload: apiToBackend.ToBackendGetVizsRequestPayload = {
      projectId: this.projectId,
      isRepoProd: this.isRepoProd,
      branchId: this.branchId,
      envId: this.envId
    };

    let getVizsResp = await mreq<apiToBackend.ToBackendGetVizsResponse>({
      token: loginUserResp.payload.token,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
      payload: getVizsReqPayload,
      config: this.context.config
    });

    let ids = this.visualizationIds?.split(',');

    if (common.isDefined(ids)) {
      ids.forEach(x => {
        if (
          getVizsResp.payload.vizs
            .map(visualization => visualization.vizId)
            .indexOf(x) < 0
        ) {
          let serverError = new common.ServerError({
            message: common.ErEnum.MCLI_VISUALIZATION_NOT_FOUND,
            data: { id: x },
            originalError: null
          });
          throw serverError;
        }
      });
    }

    let queryIdsWithDuplicates = getVizsResp.payload.vizs
      .filter(
        visualization =>
          common.isUndefined(ids) || ids.indexOf(visualization.vizId) > -1
      )
      .map(x => x.reports[0].queryId);

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
