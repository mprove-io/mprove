import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkReportsTitleModelSelect(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
}) {
  item.dashboards.forEach(x => {
    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {
      if (typeof report.title === 'undefined' || report.title === null) {
        // error e82
        let lineNums: number[] = [];
        Object.keys(report)
          .filter(p => p.match(ApRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push((<any>report)[l]));

        ErrorsCollector.addError(
          new AmError({
            title: `missing report title`,
            message: `report must have title`,
            lines: [
              {
                line: Math.min(...lineNums),
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }

      if (typeof report.model === 'undefined' || report.model === null) {
        // error e83
        ErrorsCollector.addError(
          new AmError({
            title: `missing report model`,
            message: `report must have 'model' parameter`,
            lines: [
              {
                line: report.title_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      if (!model) {
        // error e84
        ErrorsCollector.addError(
          new AmError({
            title: `missing model`,
            message: `model "${report.model}" is missing or not valid`,
            lines: [
              {
                line: report.model_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }

      if (typeof report.select === 'undefined' || report.select === null) {
        // error e85
        ErrorsCollector.addError(
          new AmError({
            title: `missing select`,
            message: `report must have 'select' parameter`,
            lines: [
              {
                line: report.title_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
