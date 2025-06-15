import { PreparedResult } from '@malloydata/malloy/index';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { makeMalloyConnections } from '~blockml/functions/make-malloy-connections';
import { RabbitService } from '~blockml/services/rabbit.service';

@Injectable()
export class ProcessQueryService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = nodeCommon.transformValidSync({
      classType: apiToBlockml.ToBlockmlProcessQueryRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let {
      projectId,
      weekStart,
      caseSensitiveStringFilters,
      simplifySafeAggregates,
      udfsDict,
      mconfig,
      modelContent: model,
      envId,
      connections,
      malloyModelDef
    } = reqValid.payload;

    let { select, sorts, timezone, limit, filters } = mconfig;

    let newFilters: common.FilterBricksDictionary = {};

    filters.forEach(f => {
      let fieldId = f.fieldId;
      let bricks = f.fractions.map(fraction => fraction.brick);
      newFilters[fieldId] = bricks;
    });

    let sql;
    let filtersFractions: {
      [s: string]: common.Fraction[];
    };
    let varsSqlSteps;
    let unsafeSelect: string[];
    let warnSelect: string[];
    let joinAggregations: common.JoinAggregation[];

    if (mconfig.modelType === common.ModelTypeEnum.Malloy) {
      //       let queryStr = `run: ec1_m2 -> {
      //   group_by: users.state
      //   aggregate: orders.orders_count
      //   limit: 10
      // }`;

      let queryStr = `run: abc`; // TODO: queryStr

      let malloyConnections = makeMalloyConnections({
        connections: connections
      });

      let pr: PreparedResult = await barSpecial.buildMalloyQuery(
        {
          malloyConnections: malloyConnections,
          malloyModelDef: malloyModelDef,
          queryStr: queryStr
        },
        this.cs
      );

      sql = pr.sql.split('\n');
      // tile.model = pr._rawQuery.sourceExplore;
      // tile.compiledQuery = pr._rawQuery;

      filtersFractions = {};
      unsafeSelect = [];
      warnSelect = [];
      joinAggregations = [];
      // varsSqlSteps = genSqlResult.varsSqlSteps;
    } else if (mconfig.modelType === common.ModelTypeEnum.SQL) {
      let genSqlResult = await barSpecial.genSql(
        this.rabbitService,
        this.cs,
        reqValid.info.traceId,
        {
          weekStart: weekStart,
          caseSensitiveStringFilters: caseSensitiveStringFilters,
          simplifySafeAggregates: simplifySafeAggregates,
          timezone: timezone,
          select: select,
          sorts: sorts,
          limit: limit.toString(),
          filters: newFilters,
          model: model,
          udfsDict: udfsDict
        }
      );

      sql = genSqlResult.sql;
      filtersFractions = genSqlResult.filtersFractions;
      varsSqlSteps = genSqlResult.varsSqlSteps;
      unsafeSelect = genSqlResult.unsafeSelect;
      warnSelect = genSqlResult.warnSelect;
      joinAggregations = genSqlResult.joinAggregations;
    }

    let queryId = nodeCommon.makeQueryId({
      projectId: projectId,
      connectionId: model.connection.connectionId,
      envId: envId,
      sql: sql,
      store: undefined, // isStore false
      storeTransformedRequestString: undefined // isStore false
    });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: model.connection.connectionId,
      connectionType: model.connection.type,
      sql: sql.join('\n'),
      apiMethod: undefined,
      apiUrl: undefined,
      apiBody: undefined,
      status: common.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: undefined,
      lastCancelTs: undefined,
      lastCompleteTs: undefined,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: undefined,
      data: undefined,
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: 0,
      bigqueryConsecutiveErrorsGetResults: 0,
      serverTs: 1
    };

    mconfig.queryId = queryId;
    mconfig.unsafeSelect = unsafeSelect;
    mconfig.warnSelect = warnSelect;
    mconfig.joinAggregations = joinAggregations;
    mconfig.temp = true;

    mconfig.filters = Object.keys(filtersFractions).map(fieldId => ({
      fieldId: fieldId,
      fractions: filtersFractions[fieldId]
    }));

    let payload: apiToBlockml.ToBlockmlProcessQueryResponsePayload = {
      mconfig: mconfig,
      query: query
    };

    return payload;
  }
}
