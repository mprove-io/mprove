import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkChartData(item: { dashboards: interfaces.Dashboard[] }) {
  item.dashboards.forEach(x => {
    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {
      let nextReport: boolean = false;

      // if ([
      //   MyChartTypeEnum.Area,
      //   MyChartTypeEnum.AreaNormalized,
      //   MyChartTypeEnum.AreaStacked,
      //   MyChartTypeEnum.BarHorizontal,
      //   MyChartTypeEnum.BarHorizontalGrouped,
      //   MyChartTypeEnum.BarHorizontalNormalized,
      //   MyChartTypeEnum.BarHorizontalStacked,
      //   MyChartTypeEnum.BarVertical,
      //   MyChartTypeEnum.BarVerticalGrouped,
      //   MyChartTypeEnum.BarVerticalNormalized,
      //   MyChartTypeEnum.BarVerticalStacked,
      //   MyChartTypeEnum.Gauge,
      //   MyChartTypeEnum.GaugeLinear,
      //   MyChartTypeEnum.HeatMap,
      //   MyChartTypeEnum.Line,
      //   MyChartTypeEnum.NumberCard,
      //   MyChartTypeEnum.Pie,
      //   MyChartTypeEnum.PieAdvanced,
      //   MyChartTypeEnum.PieGrid,
      //   MyChartTypeEnum.TreeMap,
      // ].indexOf(report.type) > -1) {

      //   if (typeof report.data === 'undefined' || report.data === null) {
      //     // error e169
      //     ErrorsCollector.addError(new AmError({
      //       title: `missing 'data'`,
      //       message: `report of type "${report.type}" must have 'data' parameter`,
      //       lines: [{
      //         line: report.title_line_num,
      //         name: x.file,
      //         path: x.path,
      //       }],
      //     }));
      //     return;
      //   }
      // }

      if (typeof report.data === 'undefined' || report.data === null) {
        newReports.push(report);
        return;
      }

      Object.keys(report.data)
        .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (nextReport) {
            return;
          }

          if (
            [
              'x_field',
              'y_field',
              'y_fields',
              'hide_columns',
              'multi_field',
              'value_field',
              'previous_value_field'
            ].indexOf(parameter) < 0
          ) {
            // error e172
            ErrorsCollector.addError(
              new AmError({
                title: `unknown report parameter`,
                message: `parameter "${parameter}" can not be used inside Report Data`,
                lines: [
                  {
                    line: (<any>report.data)[parameter + '_line_num'],
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
            Array.isArray((<any>report.data)[parameter]) &&
            ['y_fields', 'hide_columns'].indexOf(parameter) < 0
          ) {
            // error e173
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected List`,
                message: `parameter '${parameter}' can not be a List`,
                lines: [
                  {
                    line: (<any>report.data)[parameter + '_line_num'],
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
            !!(<any>report.data)[parameter] &&
            (<any>report.data)[parameter].constructor === Object
          ) {
            // error e174
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected Hash`,
                message: `parameter '${parameter}' can not be a Hash`,
                lines: [
                  {
                    line: (<any>report.data)[parameter + '_line_num'],
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
