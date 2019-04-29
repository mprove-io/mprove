import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makePdts(item: {
  views: interfaces.View[];
  udfs_dict: interfaces.UdfsDict;
  structId: string;
  bqProject: string;
  projectId: string;
}) {
  let pdts: interfaces.Pdt[] = [];

  item.views.forEach(x => {
    if (
      typeof x.derived_table !== 'undefined' &&
      x.derived_table !== null &&
      x.permanent.match(ApRegex.TRUE())
    ) {
      let permanentTable: string[] = [];

      permanentTable.push('#standardSQL');

      if (typeof x.udfs !== 'undefined' && x.udfs !== null) {
        x.udfs.forEach(udf => {
          permanentTable.push(item.udfs_dict[udf]);
        });
      }

      permanentTable.push(x.derived_table);

      let ptdDeps: string[] = [];

      if (x.pdt_view_deps) {
        Object.keys(x.pdt_view_deps).forEach(v => {
          ptdDeps.push(item.structId + '_' + v);
        });
      }

      let ptdDepsAll: string[] = [];

      if (x.pdt_view_deps_all) {
        Object.keys(x.pdt_view_deps_all).forEach(v => {
          ptdDepsAll.push(item.structId + '_' + v);
        });
      }

      let pdtName = item.structId + '_' + x.name;

      let tableRef =
        '`' + `${item.bqProject}.mprove_${item.projectId}.${pdtName}` + '`';

      pdts.push({
        view: x.name,
        name: pdtName,
        table_ref: tableRef,
        sql: permanentTable,
        pdt_deps: ptdDeps,
        pdt_deps_all: ptdDepsAll,
        pdt_trigger_time: x.pdt_trigger_time ? x.pdt_trigger_time : undefined,
        pdt_trigger_sql: x.pdt_trigger_sql
          ? '#standardSQL\n' + x.pdt_trigger_sql
          : undefined,
        pdt_trigger_sql_line_num: x.pdt_trigger_sql_line_num,
        pdt_trigger_time_line_num: x.pdt_trigger_time_line_num,
        file: x.file,
        path: x.path
      });
    }
  });

  return pdts;
}
