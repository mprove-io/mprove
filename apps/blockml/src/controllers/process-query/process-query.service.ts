import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
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
      orgId,
      projectId,
      weekStart,
      udfsDict,
      mconfig,
      modelContent: model,
      envId
    } = reqValid.payload;

    let { select, sorts, timezone, limit, filters } = mconfig;

    let newFilters: interfaces.FilterBricksDictionary = {};

    filters.forEach(f => {
      let fieldId = f.fieldId;
      let bricks = f.fractions.map(fraction => fraction.brick);
      newFilters[fieldId] = bricks;
    });

    let { sql, filtersFractions, varsSqlSteps } = await barSpecial.genSql(
      this.rabbitService,
      this.cs,
      reqValid.info.traceId,
      {
        weekStart: weekStart,
        timezone: timezone,
        select: select,
        sorts: sorts,
        limit: limit.toString(),
        filters: newFilters,
        model: model,
        udfsDict: udfsDict
      }
    );

    let queryId = helper.makeQueryId({
      orgId: orgId,
      projectId: projectId,
      connection: model.connection,
      sql: sql,
      envId: envId
    });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: model.connection.connectionId,
      connectionType: model.connection.type,
      sql: sql.join('\n'),
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
