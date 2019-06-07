import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';

export function wrapPdts(item: {
  projectId: string;
  structId: string;
  pdts: interfaces.Pdt[];
}) {
  let wrappedPdtsQueries: api.Query[] = [];

  item.pdts.forEach(pdt => {
    let queryId = helper.makeId();

    wrappedPdtsQueries.push({
      query_id: queryId,
      project_id: item.projectId,
      struct_id: item.structId,
      pdt_deps: pdt.pdt_deps,
      pdt_deps_all: pdt.pdt_deps_all,
      sql: pdt.sql,
      is_pdt: true,
      pdt_trigger_time: pdt.pdt_trigger_time,
      pdt_trigger_sql: pdt.pdt_trigger_sql,
      pdt_id: pdt.name,
      pdt_need_start_by_time: undefined,
      pdt_need_start_by_trigger_sql: undefined,
      pdt_trigger_sql_value: undefined,
      pdt_trigger_sql_last_error_message: undefined,
      status: api.QueryStatusEnum.New,
      last_run_by: undefined,
      last_run_ts: 1,
      last_cancel_ts: 1,
      last_complete_ts: 1,
      last_complete_duration: undefined,
      last_error_message: undefined,
      last_error_ts: 1,
      data: undefined,
      temp: false,
      server_ts: 1
    });
  });

  return wrappedPdtsQueries;
}
