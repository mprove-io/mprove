import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartDataParameters;

export function checkChartDataParameters<T extends types.dzType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (
        [
          apiToBlockml.ChartTypeEnum.BarVertical,
          apiToBlockml.ChartTypeEnum.BarVerticalGrouped,
          apiToBlockml.ChartTypeEnum.BarVerticalStacked,
          apiToBlockml.ChartTypeEnum.BarVerticalNormalized,
          apiToBlockml.ChartTypeEnum.BarHorizontal,
          apiToBlockml.ChartTypeEnum.BarHorizontalGrouped,
          apiToBlockml.ChartTypeEnum.BarHorizontalStacked,
          apiToBlockml.ChartTypeEnum.BarHorizontalNormalized,
          apiToBlockml.ChartTypeEnum.Pie,
          apiToBlockml.ChartTypeEnum.PieAdvanced,
          apiToBlockml.ChartTypeEnum.PieGrid,
          apiToBlockml.ChartTypeEnum.Line,
          apiToBlockml.ChartTypeEnum.Area,
          apiToBlockml.ChartTypeEnum.AreaStacked,
          apiToBlockml.ChartTypeEnum.AreaNormalized,
          apiToBlockml.ChartTypeEnum.HeatMap,
          apiToBlockml.ChartTypeEnum.TreeMap,
          apiToBlockml.ChartTypeEnum.Gauge
        ].indexOf(report.type) > -1 &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.x_field))
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
          apiToBlockml.ChartTypeEnum.BarVertical,
          apiToBlockml.ChartTypeEnum.BarHorizontal,
          apiToBlockml.ChartTypeEnum.Pie,
          apiToBlockml.ChartTypeEnum.PieAdvanced,
          apiToBlockml.ChartTypeEnum.PieGrid,
          apiToBlockml.ChartTypeEnum.TreeMap,
          apiToBlockml.ChartTypeEnum.NumberCard,
          apiToBlockml.ChartTypeEnum.Gauge
        ].indexOf(report.type) > -1 &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.y_field))
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
          apiToBlockml.ChartTypeEnum.BarVerticalGrouped,
          apiToBlockml.ChartTypeEnum.BarVerticalStacked,
          apiToBlockml.ChartTypeEnum.BarVerticalNormalized,
          apiToBlockml.ChartTypeEnum.BarHorizontalGrouped,
          apiToBlockml.ChartTypeEnum.BarHorizontalStacked,
          apiToBlockml.ChartTypeEnum.BarHorizontalNormalized,
          apiToBlockml.ChartTypeEnum.Line,
          apiToBlockml.ChartTypeEnum.Area,
          apiToBlockml.ChartTypeEnum.AreaStacked,
          apiToBlockml.ChartTypeEnum.AreaNormalized,
          apiToBlockml.ChartTypeEnum.HeatMap
        ].indexOf(report.type) > -1 &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.y_fields))
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
        report.type === apiToBlockml.ChartTypeEnum.GaugeLinear &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.value_field))
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

      if (common.isDefined(report.data)) {
        if (
          common.isDefined(report.data.x_field) &&
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
          common.isDefined(report.data.y_field) &&
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
          common.isDefined(report.data.multi_field) &&
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
          common.isDefined(report.data.value_field) &&
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
          common.isDefined(report.data.previous_value_field) &&
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

        if (common.isDefined(report.data.y_fields)) {
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

        if (common.isDefined(report.data.hide_columns)) {
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
