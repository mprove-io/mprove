import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { queriesToStats } from '~mcli/functions/get-query-stats';
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
        'mprove run visualizations --projectId DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ],
      [
        'Run visualizations for Dev repo',
        'mprove run visualizations --projectId DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ],
      [
        'Run visualizations vis1 and vis2 for Dev repo',
        'mprove run visualizations --projectId DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --ids vis1,vis2'
      ]
    ]
  });

  projectId = Option.String('-p,--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('-r,--repo', {
    required: true,
    description:
      '(required, "dev" or "production") Personal Dev Repo or Production'
  });

  branchId = Option.String('-b,--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  envId = Option.String('-e,--env', {
    required: true,
    description: '(required) Environment'
  });

  ids = Option.String('--ids', {
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
    description: '(default false) Wait for results'
  });

  seconds = Option.String('-s,--seconds', '3', {
    validator: t.isNumber(),
    description: '(default 3) Sleep time between getting results'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

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
      isRepoProd: isRepoProd,
      branchId: this.branchId,
      envId: this.envId
    };

    let getVizsResp = await mreq<apiToBackend.ToBackendGetVizsResponse>({
      token: loginUserResp.payload.token,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
      payload: getVizsReqPayload,
      config: this.context.config
    });

    let ids = this.ids?.split(',');

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

    let queryIdsWithDuplicates: string[] = [];

    let vizParts: VizPart[] = getVizsResp.payload.vizs
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

        queryIdsWithDuplicates.push(x.reports[0].queryId);

        return vizPart;
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
            isRepoProd: isRepoProd,
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

    let queriesStats = queriesToStats(queries);

    let errorVisualizations: VizPart[] =
      queriesStats.error === 0
        ? []
        : vizParts
            .filter(x => x.query.status === common.QueryStatusEnum.Error)
            .map(v => ({
              vizId: v.vizId,
              title: v.title,
              query: {
                lastErrorMessage: v.query.lastErrorMessage,
                status: v.query.status,
                queryId: v.query.queryId
              } as common.Query
            }));
    let log: any = {
      queriesStats: queriesStats
    };

    if (errorVisualizations.length > 0) {
      log.errorVisualizations = errorVisualizations;
    }

    if (this.verbose === true) {
      log.visualizations = vizParts;

      logToConsoleMcli({
        log: log,
        logLevel: common.LogLevelEnum.Info,
        context: this.context,
        isJson: this.json
      });
    } else {
      logToConsoleMcli({
        log: log,
        logLevel: common.LogLevelEnum.Info,
        context: this.context,
        isJson: this.json
      });
    }
  }
}
