import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barSql } from '~blockml/barrels/bar-sql';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { RabbitService } from '~blockml/services/rabbit.service';

export async function genSql(
  rabbitService: RabbitService,
  cs: ConfigService<interfaces.Config>,
  traceId: string,
  genSqlItem: common.GenSqlItem
) {
  genSqlItem.select = [...genSqlItem.select].sort((a, b) =>
    a > b ? 1 : b > a ? -1 : 0
  );

  let outcome: common.GenSqlProOutcome;

  let isSingle = cs.get<interfaces.Config['isSingle']>('isSingle');

  if (isSingle === common.BoolEnum.TRUE) {
    outcome = genSqlPro(genSqlItem);
  } else {
    let genSqlRequest: apiToBlockml.ToBlockmlWorkerGenSqlRequest = {
      info: {
        name: apiToBlockml.ToBlockmlWorkerRequestInfoNameEnum
          .ToBlockmlWorkerGenSql,
        traceId: traceId
      },
      payload: genSqlItem
    };

    // is main
    let resp = await rabbitService.sendToBlockmlWorker<common.MyResponse>({
      routingKey: common.RabbitBlockmlWorkerRoutingEnum.GenSql.toString(),
      message: genSqlRequest
    });

    if (resp.info.status !== common.ResponseInfoStatusEnum.Ok) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_GEN_SQL_OUTCOME_ERROR,
        originalError: resp.info.error
      });
    }

    outcome = resp.payload;
  }

  return outcome;
}

export function genSqlPro(item: common.GenSqlItem): common.GenSqlProOutcome {
  let { weekStart, timezone, select, sorts, limit, filters, model, udfsDict } =
    item;

  let varsSqlSteps: common.VarsSqlStep[] = [];

  let { depMeasures, depDimensions } = barSql.makeDepMeasuresAndDimensions({
    select,
    filters,
    model,
    varsSqlSteps
  });

  let { selected, filtered } = barSql.makeSelectedAndFiltered({
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

  let { joinAggregations } = barSql.makeJoinAggregations({
    joins,
    varsSqlSteps,
    model
  });

  let { unsafeSelect } = barSql.makeUnsafeSelect({
    select,
    joinAggregations,
    varsSqlSteps,
    model
  });

  let { mainUdfs, mainText, groupMainBy, processedFields } =
    barSql.makeMainText({
      selected,
      filtered,
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

  let { withParts, withDerivedTables, withViews } = barSql.makeWith({
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
    withDerivedTables,
    withViews,
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

  return {
    sql,
    filtersFractions,
    varsSqlSteps,
    joinAggregations,
    unsafeSelect
  };
}
