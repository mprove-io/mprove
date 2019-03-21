import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkChartAxisParameters(item: {
  dashboards: interfaces.Dashboard[];
}) {
  item.dashboards.forEach(x => {
    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {
      let nextReport: boolean = false;

      if (typeof report.axis === 'undefined' || report.axis === null) {
        newReports.push(report);
        return;
      }

      Object.keys(report.axis)
        .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (nextReport) {
            return;
          }

          if (
            [
              'x_axis',
              'show_x_axis_label',
              'x_axis_label',
              'y_axis',
              'show_y_axis_label',
              'y_axis_label',
              'show_axis'
            ].indexOf(parameter) < 0
          ) {
            // error e184
            ErrorsCollector.addError(
              new AmError({
                title: `unknown report axis parameter`,
                message: `parameter "${parameter}" can not be used inside Report Axis`,
                lines: [
                  {
                    line: (<any>report.axis)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            nextReport = true;
            return;
          }

          if (Array.isArray((<any>report.axis)[parameter])) {
            // error e185
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected List`,
                message: `parameter '${parameter}' can not be a List`,
                lines: [
                  {
                    line: (<any>report.axis)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            nextReport = true;
            return;
          }

          if (
            !!(<any>report.axis)[parameter] &&
            (<any>report.axis)[parameter].constructor === Object
          ) {
            // error e186
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected Hash`,
                message: `parameter '${parameter}' can not be a Hash`,
                lines: [
                  {
                    line: (<any>report.axis)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            nextReport = true;
            return;
          }

          if (
            [
              'x_axis',
              'show_x_axis_label',
              'y_axis',
              'show_y_axis_label',
              'show_axis'
            ].indexOf(parameter) > -1 &&
            !(<any>report.axis)[parameter]
              .toString()
              .match(ApRegex.TRUE_FALSE())
          ) {
            // error e187
            ErrorsCollector.addError(
              new AmError({
                title: `wrong report ${parameter} value`,
                message: `parameter '${parameter}' value must be "true" or "false" if specified`,
                lines: [
                  {
                    line: (<any>report.axis)[parameter + '_line_num'],
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

      if (nextReport) {
        return;
      }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
