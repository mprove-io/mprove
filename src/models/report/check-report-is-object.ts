import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkReportIsObject(item: {
  dashboards: interfaces.Dashboard[]
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      if (!(!!report && report.constructor === Object)) {
        // error e131
        ErrorsCollector.addError(new AmError({
          title: `report must be an object`,
          message: `found at least one report that is not an object`,
          lines: [{
            line: x.reports_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
