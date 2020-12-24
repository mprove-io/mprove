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
    model,
    select,
    sorts,
    timezone,
    limit,
    filters,
    udfsDict,
    weekStart,
    structId
  } = item;

  let varsSqlElements: interfaces.VarsSqlElement[] = [];

  let vars: interfaces.VarsSql = {
    model: model,
    select: select,
    sorts: sorts,
    timezone: timezone,
    limit: limit,
    filters: filters,
    filtersFractions: {},
    weekStart: weekStart,
    structId: structId,
    udfsDict: udfsDict,
    depMeasures: undefined,
    mainText: undefined,
    groupMainBy: undefined,
    mainFields: undefined,
    selected: undefined,
    processedFields: undefined,
    mainUdfs: {},
    needsDoubles: undefined,
    joins: undefined,
    needsAll: undefined,
    whereMain: {},
    havingMain: {},
    whereCalc: {},
    filtersConditions: {},
    untouchedFiltersConditions: {},
    contents: undefined,
    withParts: {},
    with: undefined,
    joinsWhere: undefined,
    query: []
  };

  let { depMeasures } = barSql.makeDepMeasures({
    select: select,
    filters: filters,
    model: model,
    varsSqlElements: varsSqlElements
  });
  vars.depMeasures = depMeasures;

  // model
  // dep_measures
  // select
  // filters
  //    main_text
  //    group_main_by
  //    main_fields
  //    selected
  //    processed_fields
  //    main_udfs_ref
  vars = barSql.makeMainFields(vars);

  // selected
  // filters
  // model
  //    needs_doubles
  vars = barSql.makeNeedsDoubles(vars);

  // model
  // need_doubles
  //    joins
  vars = barSql.findJoinsUsingJoinsDeps(vars);

  // model
  // need_doubles
  // joins
  //    needs_all
  vars = barSql.makeNeedsAll(vars);

  // joins
  // model
  // filters
  // weekStart
  //    where_main
  //    having_main
  //    where_calc
  //    filters_conditions
  //    untouched_filters_conditions
  vars = barSql.makeFilters(vars);

  // model
  // needs_all
  // joins
  // bqProject
  // projectId
  // structId
  // filters
  // udfs
  //    contents
  //    bq_views
  //    with
  //    main_udfs
  vars = barSql.makeContents(vars);

  // model
  // joins
  //    joins_where
  vars = barSql.makeJoinsWhere(vars);

  // connection
  // model
  // main_text
  // contents
  // joins_where
  // where_main
  // having_main
  // group_main_by
  // main_udfs
  // udfs_dict
  // with
  //    query
  vars = barSql.composeMain(vars);

  // query
  // timezone
  //    query
  vars = barSql.processTimezone(vars);

  // model
  // select
  // where_calc
  // bq_views
  // processed_fields
  // query
  //    bq_views
  vars = barSql.composeCalc(vars);

  return {
    sql: vars.query,
    filtersFractions: vars.filtersFractions,
    varsSqlElements: varsSqlElements
  };
}
