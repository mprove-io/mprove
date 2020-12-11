import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';
import { enums } from '../../barrels/enums';
import { barSql } from '../../barrels/bar-sql';

interface GenSqlItem {
  model: interfaces.Model;
  select: string[];
  sorts: string;
  timezone: string;
  limit: string;
  filters: { [filter: string]: string[] };
  udfsDict: api.UdfsDict;
  projectId: string;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}

export async function genSql(item: GenSqlItem) {
  // if (Object.keys(cluster.workers).length === 0) {
  //   let itemId = helper.makeId();
  //   await redisClient.set(itemId, JSON.stringify(item));
  //   let itemFromRedis = await redisClient.get(itemId);
  //   await redisClient.del(itemId);

  //   let itemFromRedisParsed = JSON.parse(itemFromRedis);
  //   let outcome = genBqViewsPro(itemFromRedisParsed);

  //   let outcomeId = helper.makeId();
  //   await redisClient.set(outcomeId, JSON.stringify(outcome));
  //   let outcomeFromRedis = await redisClient.get(outcomeId);
  //   await redisClient.del(outcomeId);

  //   let outcomeFromRedisParsed = JSON.parse(outcomeFromRedis);
  //   return outcomeFromRedisParsed;

  //   // let outcome = genBqViewsPro(item);
  //   // return outcome;
  // } else {
  //   let taskId = helper.makeId();
  //   let outcomeId = helper.makeId();

  //   let aWorker;

  //   aWorker = await ServerWorkers.get();

  //   await redisClient.set(taskId, JSON.stringify(item));

  //   // send message to worker
  //   await aWorker.send({
  //     type: enums.ProEnum.GEN_BQ_VIEWS_PRO,
  //     task_id: taskId,
  //     outcome_id: outcomeId
  //   });

  //   let outcome = await ServerOutcomes.get(outcomeId);

  //   if (outcome === enums.ProEnum.PRO_ERROR) {
  //     let proErr = ServerProErrors.get(outcomeId);

  //     ServerProErrors.delete(outcomeId);

  //     throw proErr;
  //   } else {
  //     ServerOutcomes.delete(outcomeId);

  //     return outcome;
  //   }
  // }

  let outcome = genSqlPro(item);
  return outcome;
}

function genSqlPro(item: GenSqlItem) {
  let vars: interfaces.VarsSql = {
    model: item.model,
    select: item.select,
    sorts: item.sorts,
    timezone: item.timezone,
    limit: item.limit,
    filters: item.filters,
    filtersFractions: {},
    weekStart: item.weekStart,
    projectId: item.projectId,
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
