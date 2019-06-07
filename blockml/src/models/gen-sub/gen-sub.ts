import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { makeDepMeasuresAndDimensions } from './make-dep-measures-and-dimensions';
import { makeMainFields } from './make-main-fields';
import { makeNeedsAll } from './make-needs-all';
import { makeContents } from './make-contents';
import { composeMain } from './compose-main';
import { processTimezone } from './process-timezone';
import { composeCalc } from './compose-calc';

export function genSub(item: {
  view: interfaces.View;
  select: string[];
  udfs_dict: interfaces.UdfsDict;
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnectionEnum;
  bqProject: string;
  projectId: string;
  structId: string;
}) {
  let structId = item.structId ? item.structId : 'struct_id_not_provided';

  let vars: interfaces.VarsSub = {
    view: item.view,
    select: item.select,
    timezone: item.timezone,
    weekStart: item.weekStart,
    connection: item.connection,
    bqProject: item.bqProject,
    projectId: item.projectId,
    structId: structId,
    udfs_dict: item.udfs_dict,
    dep_measures: undefined,
    dep_dimensions: undefined,
    main_text: undefined,
    group_main_by: undefined,
    main_fields: undefined,
    selected: undefined,
    processed_fields: undefined,
    extra_udfs: {},
    needs_all: undefined,
    contents: undefined,
    bqViews: undefined,
    with: undefined,
    query: undefined,
    calc_query: undefined
  };

  // view
  // select
  //    dep_measures
  vars = makeDepMeasuresAndDimensions(vars);

  // view
  // dep_measures
  // select
  //    main_text
  //    group_main_by
  //    main_fields
  //    selected
  //    processed_fields
  //    extra_udfs
  vars = makeMainFields(vars);

  // view
  // selected
  //    needs_all
  vars = makeNeedsAll(vars);

  // view
  // needs_all
  // bqProject
  // projectId
  // structId
  //    contents
  //    with
  vars = makeContents(vars);

  // view
  // main_text
  // contents
  // group_main_by
  // with
  //    query
  vars = composeMain(vars);

  // query
  // timezone
  //    query
  vars = processTimezone(vars);

  // view
  // select
  // processed_fields
  // query
  //    calc_query
  vars = composeCalc(vars);

  return { query: vars.calc_query, extra_udfs: vars.extra_udfs };
}
