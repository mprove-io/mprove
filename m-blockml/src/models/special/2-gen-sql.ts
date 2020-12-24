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
    select,
    sorts,
    limit,
    filters,
    model,
    udfsDict
  } = item;

  let varsSqlSteps: interfaces.VarsSqlStep[] = [];

  let { depMeasures } = barSql.makeDepMeasures({
    select: select,
    filters: filters,
    model: model,
    varsSqlSteps: varsSqlSteps
  });

  let {
    mainUdfs,
    mainText,
    groupMainBy,
    selected,
    processedFields,
    mainFields
  } = barSql.makeMainFields({
    select: select,
    filters: filters,
    depMeasures: depMeasures,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { needsDoubles } = barSql.makeNeedsDoubles({
    selected: selected,
    filters: filters,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { joins } = barSql.findJoinsUsingJoinsDeps({
    needsDoubles: needsDoubles,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { needsAll } = barSql.makeNeedsAll({
    needsDoubles: needsDoubles,
    joins: joins,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let {
    filtersFractions,
    whereCalc,
    havingMain,
    whereMain,
    filtersConditions,
    untouchedFiltersConditions
  } = barSql.makeFilters({
    joins: joins,
    filters: filters,
    processedFields: processedFields,
    weekStart: weekStart,
    timezone: timezone,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { contents, myWith, withParts } = barSql.makeContents({
    joins: joins,
    filters: filters,
    needsAll: needsAll,
    mainUdfs: mainUdfs,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { joinsWhere } = barSql.makeJoinsWhere({
    joins: joins,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { mainQuery } = barSql.composeMain({
    mainText: mainText,
    contents: contents,
    joinsWhere: joinsWhere,
    whereMain: whereMain,
    havingMain: havingMain,
    groupMainBy: groupMainBy,
    mainUdfs: mainUdfs,
    udfsDict: udfsDict,
    myWith: myWith,
    withParts: withParts,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { mainQueryProcessed } = barSql.processTimezone({
    mainQuery: mainQuery,
    timezone: timezone,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  let { sql } = barSql.composeCalc({
    mainQueryProcessed: mainQueryProcessed,
    processedFields: processedFields,
    select: select,
    sorts: sorts,
    limit: limit,
    whereCalc: whereCalc,
    varsSqlSteps: varsSqlSteps,
    model: model
  });

  return { sql, filtersFractions, varsSqlSteps };
}
