import { api } from '../../barrels/api';
import { barUdf } from '../../barrels/bar-udf';
import { interfaces } from '../../barrels/interfaces';

export function genBqViewsPro(item: {
  model: interfaces.Model;
  select: string[];
  sorts: string;
  limit: string;
  filters: { [filter: string]: string[] };
  udfs_user: interfaces.Udf[];
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  bqProject: string;
  projectId: string;
  structId: string;
}) {
  // if (Math.random() < 0.5) { throw new Error('boom2'); }

  let structId = item.structId ? item.structId : 'struct_id_not_provided';

  let udfsDict: interfaces.UdfsDict = barUdf.makeUdfsDict({
    udfs_user: item.udfs_user
  });

  let vars: interfaces.Vars = {
    model: item.model,
    select: item.select,
    sorts: item.sorts,
    timezone: item.timezone,
    limit: item.limit,
    filters: item.filters,
    filters_fractions: {},
    weekStart: item.weekStart,
    bqProject: item.bqProject,
    projectId: item.projectId,
    structId: structId,
    udfs_dict: udfsDict,
    dep_measures: undefined,
    main_text: undefined,
    group_main_by: undefined,
    main_fields: undefined,
    selected: undefined,
    processed_fields: undefined,
    main_udfs: {},
    needs_doubles: undefined,
    joins: undefined,
    needs_all: undefined,
    where_main: {},
    having_main: {},
    where_calc: {},
    filters_conditions: {},
    untouched_filters_conditions: {},
    contents: undefined,
    query_pdt_deps: {},
    query_pdt_deps_all: {},
    bqViews: undefined,
    with_parts: {},
    with: undefined,
    joins_where: undefined,
    query: undefined
  };

  //    у calculation фильтр или select выбираются только вместе с селектом dimensions из force dims
  //    подтягиваем зависимые measure для calculation (в селекте и фильтрах)
  // model
  // select
  // filters
  //    dep_measures_ref
  vars = this.makeDepMeasures(vars);

  //    создаем main select
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
  vars = this.makeMainFields(vars);

  //    подтягиваем для полей зависимые double deps
  // selected
  // filters
  // model
  //    needs_doubles
  vars = this.makeNeedsDoubles(vars);

  //    расширяем список джоинов через зависимости джоинов
  // model
  // need_doubles
  //    joins
  vars = this.findJoinsUsingJoinsDeps(vars);

  //    создаем список всех необходимых полей
  // model
  // need_doubles
  // joins
  //    needs_all
  vars = this.makeNeedsAll(vars);

  // joins
  // model
  // filters
  // weekStart
  //    where_main
  //    having_main
  //    where_calc
  //    filters_conditions
  //    untouched_filters_conditions
  vars = this.makeFilters(vars);

  //    derived tables
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
  vars = this.makeContents(vars);

  // model
  // joins
  //    joins_where
  vars = this.makeJoinsWhere(vars);

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
  vars = this.composeMain(vars);

  // query
  // timezone
  //    query
  vars = this.processTimezone(vars);

  // model
  // select
  // where_calc
  // bq_views
  // processed_fields
  // query
  //    bq_views
  vars = this.composeCalc(vars);

  return {
    bq_views: vars.bqViews,
    filters_fractions: vars.filters_fractions
  };
}
