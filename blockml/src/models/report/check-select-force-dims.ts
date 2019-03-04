import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkSelectForceDims(item: {
  dashboards: interfaces.Dashboard[];
}) {
  item.dashboards.forEach(x => {
    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {
      let nextReport: boolean = false;

      Object.keys(report.select_hash).forEach(element => {
        if (nextReport) {
          return;
        }

        Object.keys(report.select_hash[element]).forEach(dim => {
          if (nextReport) {
            return;
          }

          if (!report.select_hash[dim]) {
            // error e90
            ErrorsCollector.addError(
              new AmError({
                title: `calculation needs dimension`,
                message: `calculation "${element}" needs dimension "${dim}" in select`,
                lines: [
                  {
                    line: report.select_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            nextReport = true;
            return;
          }
        });
      });

      if (nextReport) {
        return;
      }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
