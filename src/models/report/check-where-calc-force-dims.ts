import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkWhereCalcForceDims(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[]
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      let model = item.models.find(m => m.name === report.model);

      if (!model.sql_always_where_calc_force_dims) {
        newReports.push(report);
        return;
      }

      Object.keys(model.sql_always_where_calc_force_dims).forEach(alias => {

        if (nextReport) { return; }

        Object.keys(model.sql_always_where_calc_force_dims[alias]).forEach(dim => {

          if (nextReport) { return; }

          let fDim = alias + '.' + dim;

          if (!report.select_hash[fDim]) {
            // error e156
            ErrorsCollector.addError(new AmError({
              title: `sql_always_where_calc needs dimension`,
              message: `'sql_always_where_calc:' needs dimension "${fDim}" in select`,
              lines: [{
                line: report.select_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }
        });
      });

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
