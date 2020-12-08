// import { api } from '../../barrels/api';
// import { barUdf } from '../../barrels/bar-udf';
// import { interfaces } from '../../barrels/interfaces';
// import { makeDepMeasures } from './make-dep-measures';
// import { makeMainFields } from './make-main-fields';
// import { makeNeedsDoubles } from './make-needs-doubles';
// import { findJoinsUsingJoinsDeps } from './find-joins-using-joins-deps';
// import { makeNeedsAll } from './make-needs-all';
// import { makeFilters } from './make-filters';
// import { makeContents } from './make-contents';
// import { makeJoinsWhere } from './make-joins-where';
// import { composeMain } from './compose-main';
// import { processTimezone } from './process-timezone';
// import { composeCalc } from './compose-calc';

// export function genBqViewsPro(item: {
//   model: interfaces.Model;
//   select: string[];
//   sorts: string;
//   limit: string;
//   filters: { [filter: string]: string[] };
//   udfs_user: interfaces.Udf[];
//   timezone: string;
//   weekStart: api.ProjectWeekStartEnum;
//   connection: api.ProjectConnectionEnum;
//   bqProject: string;
//   projectId: string;
//   structId: string;
// }) {
//   let structId = item.structId ? item.structId : 'struct_id_not_provided';

//   let udfsDict: interfaces.UdfsDict = barUdf.makeUdfsDict({
//     udfs_user: item.udfs_user
//   });

//   let vars: interfaces.Vars = {
//     model: item.model,
//     select: item.select,
//     sorts: item.sorts,
//     timezone: item.timezone,
//     limit: item.limit,
//     filters: item.filters,
//     filters_fractions: {},
//     weekStart: item.weekStart,
//     connection: item.connection,
//     bqProject: item.bqProject,
//     projectId: item.projectId,
//     structId: structId,
//     udfs_dict: udfsDict,
//     dep_measures: undefined,
//     main_text: undefined,
//     group_main_by: undefined,
//     main_fields: undefined,
//     selected: undefined,
//     processed_fields: undefined,
//     main_udfs: {},
//     needs_doubles: undefined,
//     joins: undefined,
//     needs_all: undefined,
//     where_main: {},
//     having_main: {},
//     where_calc: {},
//     filters_conditions: {},
//     untouched_filters_conditions: {},
//     contents: undefined,
//     query_pdt_deps: {},
//     query_pdt_deps_all: {},
//     bqViews: undefined,
//     with_parts: {},
//     with: undefined,
//     joins_where: undefined,
//     query: undefined
//   };

//   // model
//   // select
//   // filters
//   //    dep_measures_ref
//   vars = makeDepMeasures(vars);

//   // model
//   // dep_measures
//   // select
//   // filters
//   //    main_text
//   //    group_main_by
//   //    main_fields
//   //    selected
//   //    processed_fields
//   //    main_udfs_ref
//   vars = makeMainFields(vars);

//   // selected
//   // filters
//   // model
//   //    needs_doubles
//   vars = makeNeedsDoubles(vars);

//   // model
//   // need_doubles
//   //    joins
//   vars = findJoinsUsingJoinsDeps(vars);

//   // model
//   // need_doubles
//   // joins
//   //    needs_all
//   vars = makeNeedsAll(vars);

//   // joins
//   // model
//   // filters
//   // weekStart
//   //    where_main
//   //    having_main
//   //    where_calc
//   //    filters_conditions
//   //    untouched_filters_conditions
//   vars = makeFilters(vars);

//   // model
//   // needs_all
//   // joins
//   // bqProject
//   // projectId
//   // structId
//   // filters
//   // udfs
//   //    contents
//   //    bq_views
//   //    with
//   //    main_udfs
//   vars = makeContents(vars);

//   // model
//   // joins
//   //    joins_where
//   vars = makeJoinsWhere(vars);

//   // connection
//   // model
//   // main_text
//   // contents
//   // joins_where
//   // where_main
//   // having_main
//   // group_main_by
//   // main_udfs
//   // udfs_dict
//   // with
//   //    query
//   vars = composeMain(vars);

//   // query
//   // timezone
//   //    query
//   vars = processTimezone(vars);

//   // model
//   // select
//   // where_calc
//   // bq_views
//   // processed_fields
//   // query
//   //    bq_views
//   vars = composeCalc(vars);

//   return {
//     bq_views: vars.bqViews,
//     filters_fractions: vars.filters_fractions
//   };
// }
