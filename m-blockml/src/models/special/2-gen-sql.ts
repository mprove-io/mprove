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

  let { depMeasures, depDimensions } = barSql.makeDepMeasuresAndDimensions({
    select,
    filters,
    model,
    varsSqlSteps
  });

  let {
    mainUdfs,
    mainText,
    groupMainBy,
    selected,
    processedFields
  } = barSql.makeMainText({
    select,
    filters,
    depMeasures,
    depDimensions,
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
    filterFieldsConditions
  } = barSql.makeFilters({
    joins,
    filters,
    processedFields,
    weekStart,
    timezone,
    varsSqlSteps,
    model
  });

  let { myWith, withParts } = barSql.makeWith({
    mainUdfs,
    mainText,
    joins,
    filters,
    needsAll,
    filterFieldsConditions,
    varsSqlSteps,
    model
  });

  let { top } = barSql.makeTop({
    mainUdfs,
    withParts,
    myWith,
    varsSqlSteps,
    model,
    udfsDict
  });

  let { mainQuery } = barSql.composeMain({
    top,
    joins,
    whereMain,
    havingMain,
    groupMainBy,
    filterFieldsConditions,
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
    select,
    sorts,
    limit,
    whereCalc,
    filterFieldsConditions,
    varsSqlSteps,
    model
  });

  return { sql, filtersFractions, varsSqlSteps };
}
