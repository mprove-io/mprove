import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckChartDataParameters;

export function checkChartDataParameters<T extends types.dzType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (
        [
          api.ChartTypeEnum.BarVertical,
          api.ChartTypeEnum.BarVerticalGrouped,
          api.ChartTypeEnum.BarVerticalStacked,
          api.ChartTypeEnum.BarVerticalNormalized,
          api.ChartTypeEnum.BarHorizontal,
          api.ChartTypeEnum.BarHorizontalGrouped,
          api.ChartTypeEnum.BarHorizontalStacked,
          api.ChartTypeEnum.BarHorizontalNormalized,
          api.ChartTypeEnum.Pie,
          api.ChartTypeEnum.PieAdvanced,
          api.ChartTypeEnum.PieGrid,
          api.ChartTypeEnum.Line,
          api.ChartTypeEnum.Area,
          api.ChartTypeEnum.AreaStacked,
          api.ChartTypeEnum.AreaNormalized,
          api.ChartTypeEnum.HeatMap,
          api.ChartTypeEnum.TreeMap,
          api.ChartTypeEnum.Gauge
        ].indexOf(report.type) > -1 &&
        (helper.isUndefined(report.data) ||
          helper.isUndefined(report.data.x_field))
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_DATA_MISSING_X_FIELD,
            message:
              `report of type "${report.type}" must have ` +
              `"${enums.ParameterEnum.XField}" parameter in "${enums.ParameterEnum.Data}"`,
            lines: [
              {
                line: report.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [
          api.ChartTypeEnum.BarVertical,
          api.ChartTypeEnum.BarHorizontal,
          api.ChartTypeEnum.Pie,
          api.ChartTypeEnum.PieAdvanced,
          api.ChartTypeEnum.PieGrid,
          api.ChartTypeEnum.TreeMap,
          api.ChartTypeEnum.NumberCard,
          api.ChartTypeEnum.Gauge
        ].indexOf(report.type) > -1 &&
        (helper.isUndefined(report.data) ||
          helper.isUndefined(report.data.y_field))
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_DATA_MISSING_Y_FIELD,
            message:
              `report of type "${report.type}" must have ` +
              `"${enums.ParameterEnum.YField}" parameter in "${enums.ParameterEnum.Data}"`,
            lines: [
              {
                line: report.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [
          api.ChartTypeEnum.BarVerticalGrouped,
          api.ChartTypeEnum.BarVerticalStacked,
          api.ChartTypeEnum.BarVerticalNormalized,
          api.ChartTypeEnum.BarHorizontalGrouped,
          api.ChartTypeEnum.BarHorizontalStacked,
          api.ChartTypeEnum.BarHorizontalNormalized,
          api.ChartTypeEnum.Line,
          api.ChartTypeEnum.Area,
          api.ChartTypeEnum.AreaStacked,
          api.ChartTypeEnum.AreaNormalized,
          api.ChartTypeEnum.HeatMap
        ].indexOf(report.type) > -1 &&
        (helper.isUndefined(report.data) ||
          helper.isUndefined(report.data.y_fields))
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_DATA_MISSING_Y_FIELDS,
            message:
              `report of type "${report.type}" must have ` +
              `"${enums.ParameterEnum.YFields}" parameter in "${enums.ParameterEnum.Data}"`,
            lines: [
              {
                line: report.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        report.type === api.ChartTypeEnum.GaugeLinear &&
        (helper.isUndefined(report.data) ||
          helper.isUndefined(report.data.value_field))
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.REPORT_DATA_MISSING_VALUE_FIELD,
            message:
              `report of type "${report.type}" must have ` +
              `"${enums.ParameterEnum.ValueField}" parameter in "${enums.ParameterEnum.Data}"`,
            lines: [
              {
                line: report.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (helper.isDefined(report.data)) {
        if (
          helper.isDefined(report.data.x_field) &&
          report.select.indexOf(report.data.x_field) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_DATA_WRONG_X_FIELD,
              message:
                `"${enums.ParameterEnum.XField}" value must be one of ` +
                `"${enums.ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: report.data.x_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          helper.isDefined(report.data.y_field) &&
          report.select.indexOf(report.data.y_field) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_DATA_WRONG_Y_FIELD,
              message:
                `"${enums.ParameterEnum.YField}" value must be one of ` +
                `"${enums.ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: report.data.y_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          helper.isDefined(report.data.multi_field) &&
          report.select.indexOf(report.data.multi_field) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_DATA_WRONG_MULTI_FIELD,
              message:
                `"${enums.ParameterEnum.MultiField}" value must be one of ` +
                `"${enums.ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: report.data.multi_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          helper.isDefined(report.data.value_field) &&
          report.select.indexOf(report.data.value_field) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_DATA_WRONG_VALUE_FIELD,
              message:
                `"${enums.ParameterEnum.ValueField}" value must be one of ` +
                `"${enums.ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: report.data.value_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          helper.isDefined(report.data.previous_value_field) &&
          report.select.indexOf(report.data.previous_value_field) < 0
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD,
              message:
                `"${enums.ParameterEnum.PreviousValueField}" value must be one of ` +
                `"${enums.ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: report.data.previous_value_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (helper.isDefined(report.data.y_fields)) {
          if (!Array.isArray(report.data.y_fields)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DATA_Y_FIELDS_MUST_BE_A_LIST,
                message: `parameter "${enums.ParameterEnum.YFields}" must be a list`,
                lines: [
                  {
                    line: report.data.y_fields_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          report.data.y_fields.forEach(element => {
            if (report.select.indexOf(element) < 0) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.REPORT_DATA_WRONG_Y_FIELDS_ELEMENT,
                  message:
                    `found element "${element}" that is not ` +
                    `listed in "${enums.ParameterEnum.Select}"`,
                  lines: [
                    {
                      line: report.data.y_fields_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          });
        }

        if (helper.isDefined(report.data.hide_columns)) {
          if (!Array.isArray(report.data.hide_columns)) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_DATA_HIDE_COLUMNS_MUST_BE_A_LIST,
                message: `parameter "${enums.ParameterEnum.HideColumns}" must be a list`,
                lines: [
                  {
                    line: report.data.hide_columns_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          report.data.hide_columns.forEach(element => {
            if (report.select.indexOf(element) < 0) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum.REPORT_DATA_WRONG_HIDE_COLUMNS_ELEMENT,
                  message:
                    `found element "${element}" that is not ` +
                    `listed in "${enums.ParameterEnum.Select}"`,
                  lines: [
                    {
                      line: report.data.hide_columns_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          });
        }
      }
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
