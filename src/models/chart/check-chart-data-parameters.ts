import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function checkChartDataParameters(item: {
  dashboards: interfaces.Dashboard[]
}) {

  let chartTypesXField = [
    api.ChartTypeEnum.BarVertical, 'bar_vertical',
    api.ChartTypeEnum.BarVerticalGrouped, 'bar_vertical_grouped',
    api.ChartTypeEnum.BarVerticalStacked, 'bar_vertical_stacked',
    api.ChartTypeEnum.BarVerticalNormalized, 'bar_vertical_normalized',
    api.ChartTypeEnum.BarHorizontal, 'bar_horizontal',
    api.ChartTypeEnum.BarHorizontalGrouped, 'bar_horizontal_grouped',
    api.ChartTypeEnum.BarHorizontalStacked, 'bar_horizontal_stacked',
    api.ChartTypeEnum.BarHorizontalNormalized, 'bar_horizontal_normalized',
    api.ChartTypeEnum.Pie, 'pie',
    api.ChartTypeEnum.PieAdvanced, 'pie_advanced',
    api.ChartTypeEnum.PieGrid, 'pie_grid',
    api.ChartTypeEnum.Line, 'line',
    api.ChartTypeEnum.Area, 'area',
    api.ChartTypeEnum.AreaStacked, 'area_stacked',
    api.ChartTypeEnum.AreaNormalized, 'area_normalized',
    api.ChartTypeEnum.HeatMap, 'heat_map',
    api.ChartTypeEnum.TreeMap, 'tree_map',
    api.ChartTypeEnum.Gauge, 'gauge',
  ];

  let chartTypesYField = [
    api.ChartTypeEnum.BarVertical, 'bar_vertical',
    api.ChartTypeEnum.BarHorizontal, 'bar_horizontal',
    api.ChartTypeEnum.Pie, 'pie',
    api.ChartTypeEnum.PieAdvanced, 'pie_advanced',
    api.ChartTypeEnum.PieGrid, 'pie_grid',
    api.ChartTypeEnum.TreeMap, 'tree_map',
    api.ChartTypeEnum.NumberCard, 'number_card',
    api.ChartTypeEnum.Gauge, 'gauge',
  ];

  let chartTypesYFields = [
    api.ChartTypeEnum.BarVerticalGrouped, 'bar_vertical_grouped',
    api.ChartTypeEnum.BarVerticalStacked, 'bar_vertical_stacked',
    api.ChartTypeEnum.BarVerticalNormalized, 'bar_vertical_normalized',
    api.ChartTypeEnum.BarHorizontalGrouped, 'bar_horizontal_grouped',
    api.ChartTypeEnum.BarHorizontalStacked, 'bar_horizontal_stacked',
    api.ChartTypeEnum.BarHorizontalNormalized, 'bar_horizontal_normalized',
    api.ChartTypeEnum.Line, 'line',
    api.ChartTypeEnum.Area, 'area',
    api.ChartTypeEnum.AreaStacked, 'area_stacked',
    api.ChartTypeEnum.AreaNormalized, 'area_normalized',
    api.ChartTypeEnum.HeatMap, 'heat_map',
  ];

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      if (chartTypesXField.indexOf(report.type) > -1 &&
        (typeof report.data === 'undefined' || report.data === null ||
          typeof report.data.x_field === 'undefined' || report.data.x_field === null)) {
        // error e176
        ErrorsCollector.addError(new AmError({
          title: `missing 'x_field'`,
          message: `report of type "${report.type}" must have 'x_field' parameter in data`,
          lines: [{
            line: report.data_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      if (chartTypesYField.indexOf(report.type) > -1 &&
        (typeof report.data === 'undefined' || report.data === null ||
          typeof report.data.y_field === 'undefined' || report.data.y_field === null)) {
        // error e177
        ErrorsCollector.addError(new AmError({
          title: `missing 'y_field'`,
          message: `report of type "${report.type}" must have 'y_field' parameter in data`,
          lines: [{
            line: report.data_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      if (chartTypesYFields.indexOf(report.type) > -1 &&
        (typeof report.data === 'undefined' || report.data === null ||
          typeof report.data.y_fields === 'undefined' || report.data.y_fields === null)) {
        // error e206
        ErrorsCollector.addError(new AmError({
          title: `missing 'y_fields'`,
          message: `report of type "${report.type}" must have 'y_fields' parameter in data`,
          lines: [{
            line: report.data_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      if (report.type === api.ChartTypeEnum.GaugeLinear &&
        (typeof report.data === 'undefined' || report.data === null ||
          typeof report.data.value_field === 'undefined' || report.data.value_field === null)) {
        // error e178
        ErrorsCollector.addError(new AmError({
          title: `missing 'value_field'`,
          message: `report of type "${report.type}" must have 'value_field' parameter in data`,
          lines: [{
            line: report.data_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }


      if (typeof report.data !== 'undefined' && report.data !== null) {


        if (typeof report.data.x_field !== 'undefined' && report.data.x_field !== null &&
          report.select.indexOf(report.data.x_field) < 0) {
          // error e179
          ErrorsCollector.addError(new AmError({
            title: `wrong 'x_field' value`,
            message: `'x_field' value must be one of 'select' elements`,
            lines: [{
              line: report.data.x_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        if (typeof report.data.y_field !== 'undefined' && report.data.y_field !== null &&
          report.select.indexOf(report.data.y_field) < 0) {
          // error e180
          ErrorsCollector.addError(new AmError({
            title: `wrong 'y_field' value`,
            message: `'y_field' value must be one of 'select' elements`,
            lines: [{
              line: report.data.y_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        if (typeof report.data.multi_field !== 'undefined' && report.data.multi_field !== null &&
          report.select.indexOf(report.data.multi_field) < 0) {
          // error e181
          ErrorsCollector.addError(new AmError({
            title: `wrong 'multi_field' value`,
            message: `'multi_field' value must be one of 'select' elements`,
            lines: [{
              line: report.data.multi_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        if (typeof report.data.value_field !== 'undefined' && report.data.value_field !== null &&
          report.select.indexOf(report.data.value_field) < 0) {
          // error e182
          ErrorsCollector.addError(new AmError({
            title: `wrong 'value_field' value`,
            message: `'value_field' value must be one of 'select' elements`,
            lines: [{
              line: report.data.value_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        if (typeof report.data.previous_value_field !== 'undefined' && report.data.previous_value_field !== null &&
          report.select.indexOf(report.data.previous_value_field) < 0) {
          // error e183
          ErrorsCollector.addError(new AmError({
            title: `wrong 'previous_value_field' value`,
            message: `'previous_value_field' value must be one of 'select' elements`,
            lines: [{
              line: report.data.previous_value_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        if (typeof report.data.y_fields !== 'undefined' && report.data.y_fields !== null) {

          if (!Array.isArray(report.data.y_fields)) {
            // error e207
            ErrorsCollector.addError(new AmError({
              title: `y_fields must be an Array`,
              message: `"y_fields" must have element(s) inside like:
- 'alias.field_name'
- 'alias.field_name'`,
              lines: [{
                line: report.data.y_fields_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            return;
          }

          report.data.y_fields.forEach(element => {

            if (nextReport) { return; }

            if (report.select.indexOf(element) < 0) {
              // error e208
              ErrorsCollector.addError(new AmError({
                title: `wrong y_fields element`,
                message: `found element "- ${element}" that is not listed in report 'select' parameter values`,
                lines: [{
                  line: report.data.y_fields_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }
          });
        }

        if (typeof report.data.hide_columns !== 'undefined' && report.data.hide_columns !== null) {

          if (!Array.isArray(report.data.hide_columns)) {
            // error e288
            ErrorsCollector.addError(new AmError({
              title: `hide_columns must be an Array`,
              message: `"hide_columns" must have element(s) inside like:
- 'alias.field_name'
- 'alias.field_name'`,
              lines: [{
                line: report.data.hide_columns_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            return;
          }

          report.data.hide_columns.forEach(element => {

            if (nextReport) { return; }

            if (report.select.indexOf(element) < 0) {
              // error e289
              ErrorsCollector.addError(new AmError({
                title: `wrong hide_columns element`,
                message: `found element "- ${element}" that is not listed in report 'select' parameter values`,
                lines: [{
                  line: report.data.hide_columns_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }
          });
        }
      }

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}