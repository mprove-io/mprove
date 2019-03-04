import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkReportsIsArray(item: {
  dashboards: interfaces.Dashboard[]
}) {

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
    if (typeof x.reports === 'undefined' || x.reports === null) {
      // error e264
      ErrorsCollector.addError(new AmError({
        title: `missing reports`,
        message: `parameter 'reports' is required for Dashboard`,
        lines: [{
          line: x.dashboard_line_num,
          name: x.file,
          path: x.path,
        }],
      }));
      return;
    }

    if (!Array.isArray(x.reports)) {
      // error e81
      ErrorsCollector.addError(new AmError({
        title: `reports is not a List`,
        message: `reports must be a List of Objects`,
        lines: [{
          line: x.reports_line_num,
          name: x.file,
          path: x.path,
        }],
      }));
      return;
    }

    newDashboards.push(x);
  });

  return newDashboards;
}