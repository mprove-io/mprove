import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface VizPart {
  vizId: string;
  title: string;
  query: common.Query;
}

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

  verbose = Option.Boolean('-v,--verbose', false, {
    description: '(default false)'
  });

  json = Option.Boolean('-j,--json', false, {
    description: '(default false)'
  });

  wait = Option.Boolean('-w,--wait', false, {
    description: '(default false)'
  });

  seconds = Option.String('-s,--seconds', '3', {
    validator: t.isNumber(),
    description: '(default 3) sleep time between get results'
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

    let vizParts: VizPart[] = [];

    let queryIdsWithDuplicates = getVizsResp.payload.vizs
      .filter(
        visualization =>
          common.isUndefined(ids) || ids.indexOf(visualization.vizId) > -1
      )
      .map(x => {
        let vizPart: VizPart = {
          title: x.title,
          vizId: x.vizId,
          query: { queryId: x.reports[0].queryId } as common.Query
        };

        vizParts.push(vizPart);

        return x.reports[0].queryId;
      });

    let uniqueQueryIds = [...new Set(queryIdsWithDuplicates)];

    let runQueriesReqPayload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      projectId: this.projectId,
      queryIds: uniqueQueryIds
    };

    let runQueriesResp = await mreq<apiToBackend.ToBackendRunQueriesResponse>({
      token: loginUserResp.payload.token,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      config: this.context.config
    });

    vizParts.forEach(v => {
      let query = runQueriesResp.payload.runningQueries.find(
        q => q.queryId === v.query.queryId
      );
      v.query = query;
    });

    let queryIdsToGet: string[] = [...uniqueQueryIds];

    if (this.wait === true) {
      await common.sleep(this.seconds * 1000);

      while (queryIdsToGet.length > 0) {
        let getQueriesReqPayload: apiToBackend.ToBackendGetQueriesRequestPayload =
          {
            projectId: this.projectId,
            isRepoProd: this.isRepoProd,
            branchId: this.branchId,
            envId: this.envId,
            queryIds: uniqueQueryIds
          };

        let getQueriesResp =
          await mreq<apiToBackend.ToBackendGetQueriesResponse>({
            token: loginUserResp.payload.token,
            pathInfoName:
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQueries,
            payload: getQueriesReqPayload,
            config: this.context.config
          });

        getQueriesResp.payload.queries.forEach(query => {
          if (query.status !== common.QueryStatusEnum.Running) {
            vizParts
              .filter(vizPart => vizPart.query.queryId === query.queryId)
              .forEach(x => (x.query = query));

            queryIdsToGet = queryIdsToGet.filter(id => id !== query.queryId);
          }
        });

        if (queryIdsToGet.length > 0) {
          await common.sleep(this.seconds * 1000);
        }
      }
    }

    let queries = uniqueQueryIds.map(
      x => vizParts.find(vp => vp.query.queryId === x).query
    );

    let stats = {
      queriesCompleted: queries.filter(
        q => q.status === common.QueryStatusEnum.Completed
      ).length,
      queriesError: queries.filter(
        q => q.status === common.QueryStatusEnum.Error
      ).length,
      queriesRunning: queries.filter(
        q => q.status === common.QueryStatusEnum.Running
      ).length,
      queriesCanceled: queries.filter(
        q => q.status === common.QueryStatusEnum.Canceled
      ).length
    };

    if (this.verbose === true) {
      logToConsoleMcli({
        log: {
          stats: stats,
          visualizations: vizParts
        },
        logLevel: common.LogLevelEnum.Info,
        context: this.context,
        isJson: this.json
      });
    } else {
      logToConsoleMcli({
        log: {
          stats: stats
        },
        logLevel: common.LogLevelEnum.Info,
        context: this.context,
        isJson: this.json
      });
    }
  }
}
