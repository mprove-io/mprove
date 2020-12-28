import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { barSql } from '../../barrels/bar-sql';
import { RabbitService } from '../../services/rabbit.service';

export async function genSql(
  rabbitService: RabbitService,
  traceId: string,
  genSqlItem: interfaces.GenSqlItem
) {
  let outcome: interfaces.GenSqlProOutcome;

  if (process.env.MPROVE_BLOCKML_IS_SINGLE === 'TRUE') {
    outcome = genSqlPro(genSqlItem);
  } else {
    let genSqlRequest: api.ToBlockmlWorkerGenSqlRequest = {
      info: {
        name: api.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql,
        traceId: traceId
      },
      payload: genSqlItem
    };

    // is main
    let resp = await rabbitService.sendToBlockmlWorker<
      api.ToBlockmlWorkerGenSqlResponse | api.ErrorResponse
    >({
      routingKey: api.RabbitBlockmlWorkerRoutingEnum.GenSql.toString(),
      message: genSqlRequest
    });

    if (resp.info.status !== api.ResponseInfoStatusEnum.Ok) {
      throw new api.ServerError({
        message: api.ErEnum.M_BLOCKML_GEN_SQL_OUTCOME_ERROR,
        originalError: resp.info.error
      });
    }

    outcome = resp.payload;
  }

  return outcome;
}

export function genSqlPro(
  item: interfaces.GenSqlItem
): interfaces.GenSqlProOutcome {
  let {
    weekStart,
    timezone,
    selectWithForceDims,
    sorts,
    limit,
    filters,
    model,
    udfsDict
  } = item;

  let varsSqlSteps: interfaces.VarsSqlStep[] = [];

  let { depMeasures } = barSql.makeDepMeasures({
    selectWithForceDims,
    filters,
    model,
    varsSqlSteps
  });

  let {
    mainUdfs,
    mainText,
    groupMainBy,
    selected,
    processedFields,
    mainFields
  } = barSql.makeMainFields({
    selectWithForceDims,
    filters,
    depMeasures,
    varsSqlSteps,
    model
  });

  let { needsDoubles } = barSql.makeNeedsDoubles({
    selected,
    filters,
    varsSqlSteps,
    model
  });

  let { joins } = barSql.findJoinsUsingJoinsDeps({
    needsDoubles,
    varsSqlSteps,
    model
  });

  let { needsAll } = barSql.makeNeedsAll({
    needsDoubles,
    joins,
    varsSqlSteps,
    model
  });

  let {
    filtersFractions,
    whereCalc,
    havingMain,
    whereMain,
    filtersConditions,
    untouchedFiltersConditions
  } = barSql.makeFilters({
    joins,
    filters,
    processedFields,
    weekStart,
    timezone,
    varsSqlSteps,
    model
  });

  let { contents, myWith, withParts } = barSql.makeContents({
    joins,
    filters,
    needsAll,
    mainUdfs,
    varsSqlSteps,
    model
  });

  let { joinsWhere } = barSql.makeJoinsWhere({
    joins,
    varsSqlSteps,
    model
  });

  let { mainQuery } = barSql.composeMain({
    mainText,
    contents,
    joinsWhere,
    whereMain,
    havingMain,
    groupMainBy,
    mainUdfs,
    udfsDict,
    myWith,
    withParts,
    varsSqlSteps,
    model
  });

  let { mainQueryProcessed } = barSql.processTimezone({
    mainQuery,
    timezone,
    varsSqlSteps,
    model
  });

  let { sql } = barSql.composeCalc({
    mainQueryProcessed,
    processedFields,
    selectWithForceDims,
    sorts,
    limit,
    whereCalc,
    varsSqlSteps,
    model
  });

  return { sql, filtersFractions, varsSqlSteps };
}
