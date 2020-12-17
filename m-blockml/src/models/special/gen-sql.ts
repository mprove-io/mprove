import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { barSql } from '../../barrels/bar-sql';
import { RabbitService } from 'src/services/rabbit.service';

export async function genSql(
  rabbitService: RabbitService,
  item: interfaces.GenSqlItem
) {
  let outcome: interfaces.GenSqlProOutcome;

  if (process.env.MPROVE_BLOCKML_IS_SINGLE === 'TRUE') {
    outcome = genSqlPro(item);
  } else {
    // is main
    let resp = await rabbitService.sendToBlockmlWorker<
      api.ToBlockmlWorkerGenSqlResponse | api.ErrorResponse
    >({
      routingKey: api.RabbitBlockmlWorkerRoutingEnum.GenSql.toString(),
      message: item
    });

    if (resp.info.status !== api.ResponseInfoStatusEnum.Ok) {
      throw new api.ServerError({
        message: api.ErEnum.M_BLOCKML_GEN_SQL_OUTCOME_ERROR,
        originalError: resp.info.error
      });
    }

    outcome = resp.payload;
  }

  // TODO: item.errors update

  return outcome;
}

export function genSqlPro(item: interfaces.GenSqlItem) {
  let vars: interfaces.VarsSql = {
    model: item.model,
    select: item.select,
    sorts: item.sorts,
    timezone: item.timezone,
    limit: item.limit,
    filters: item.filters,
    filtersFractions: {},
    weekStart: item.weekStart,
    structId: item.structId,
    udfsDict: item.udfsDict,
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
    // query_pdt_deps: {},
    // query_pdt_deps_all: {},
    // bqViews: undefined,
    withParts: {},
    with: undefined,
    joinsWhere: undefined,
    query: []
  };

  // model
  // select
  // filters
  //    dep_measures_ref
  vars = barSql.makeDepMeasures(vars);

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
    filtersFractions: vars.filtersFractions
  };
}
