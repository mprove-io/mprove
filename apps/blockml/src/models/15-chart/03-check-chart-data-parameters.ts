import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartDataParameters;

export function checkChartDataParameters<T extends types.dzType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, models } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      let model = item.models.find(m => m.name === report.model);

      if (
        [
          common.ChartTypeEnum.BarVertical,
          common.ChartTypeEnum.BarVerticalGrouped,
          common.ChartTypeEnum.BarVerticalStacked,
          common.ChartTypeEnum.BarVerticalNormalized,
          common.ChartTypeEnum.BarHorizontal,
          common.ChartTypeEnum.BarHorizontalGrouped,
          common.ChartTypeEnum.BarHorizontalStacked,
          common.ChartTypeEnum.BarHorizontalNormalized,
          common.ChartTypeEnum.Pie,
          common.ChartTypeEnum.PieAdvanced,
          common.ChartTypeEnum.PieGrid,
          common.ChartTypeEnum.Line,
          common.ChartTypeEnum.Area,
          common.ChartTypeEnum.AreaStacked,
          common.ChartTypeEnum.AreaNormalized,
          common.ChartTypeEnum.HeatMap,
          common.ChartTypeEnum.TreeMap,
          common.ChartTypeEnum.Gauge
        ].indexOf(report.type) > -1 &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.x_field))
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.REPORT_DATA_MISSING_X_FIELD,
            message:
              `report of type "${report.type}" must have ` +
              `"${common.ParameterEnum.XField}" parameter in "${common.ParameterEnum.Data}"`,
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
          common.ChartTypeEnum.BarVertical,
          common.ChartTypeEnum.BarHorizontal,
          common.ChartTypeEnum.Pie,
          common.ChartTypeEnum.PieAdvanced,
          common.ChartTypeEnum.PieGrid,
          common.ChartTypeEnum.TreeMap,
          common.ChartTypeEnum.NumberCard,
          common.ChartTypeEnum.Gauge
        ].indexOf(report.type) > -1 &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.y_field))
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.REPORT_DATA_MISSING_Y_FIELD,
            message:
              `report of type "${report.type}" must have ` +
              `"${common.ParameterEnum.YField}" parameter in "${common.ParameterEnum.Data}"`,
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
          common.ChartTypeEnum.BarVerticalGrouped,
          common.ChartTypeEnum.BarVerticalStacked,
          common.ChartTypeEnum.BarVerticalNormalized,
          common.ChartTypeEnum.BarHorizontalGrouped,
          common.ChartTypeEnum.BarHorizontalStacked,
          common.ChartTypeEnum.BarHorizontalNormalized,
          common.ChartTypeEnum.Line,
          common.ChartTypeEnum.Area,
          common.ChartTypeEnum.AreaStacked,
          common.ChartTypeEnum.AreaNormalized,
          common.ChartTypeEnum.HeatMap
        ].indexOf(report.type) > -1 &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.y_fields))
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.REPORT_DATA_MISSING_Y_FIELDS,
            message:
              `report of type "${report.type}" must have ` +
              `"${common.ParameterEnum.YFields}" parameter in "${common.ParameterEnum.Data}"`,
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
        report.type === common.ChartTypeEnum.GaugeLinear &&
        (common.isUndefined(report.data) ||
          common.isUndefined(report.data.value_field))
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.REPORT_DATA_MISSING_VALUE_FIELD,
            message:
              `report of type "${report.type}" must have ` +
              `"${common.ParameterEnum.ValueField}" parameter in "${common.ParameterEnum.Data}"`,
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

      if (common.isUndefined(report.data)) {
        return;
      }

      if (common.isDefined(report.data.x_field)) {
        if (report.select.indexOf(report.data.x_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_WRONG_X_FIELD,
              message:
                `"${common.ParameterEnum.XField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
        } else {
          let field = getField({
            model: model,
            fieldId: report.data.x_field
          });

          if (field.fieldClass !== common.FieldClassEnum.Dimension) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_WRONG_X_FIELD_CLASS,
                message: `"${common.ParameterEnum.XField}" must be a Dimension`,
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
        }
      }

      if (common.isDefined(report.data.y_field)) {
        if (report.select.indexOf(report.data.y_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_WRONG_Y_FIELD,
              message:
                `"${common.ParameterEnum.YField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
        } else {
          let field = getField({
            model: model,
            fieldId: report.data.y_field
          });

          if (
            field.fieldClass !== common.FieldClassEnum.Measure &&
            field.fieldClass !== common.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_WRONG_Y_FIELD_CLASS,
                message: `"${common.ParameterEnum.YField}" must be a Measure or Calculation`,
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
        }
      }

      if (common.isDefined(report.data.multi_field)) {
        if (report.select.indexOf(report.data.multi_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_WRONG_MULTI_FIELD,
              message:
                `"${common.ParameterEnum.MultiField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
        } else {
          let field = getField({
            model: model,
            fieldId: report.data.multi_field
          });

          if (field.fieldClass !== common.FieldClassEnum.Dimension) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_WRONG_MULTI_FIELD_CLASS,
                message: `"${common.ParameterEnum.MultiField}" must be a Dimension`,
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
        }
      }

      if (common.isDefined(report.data.value_field)) {
        if (report.select.indexOf(report.data.value_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_WRONG_VALUE_FIELD,
              message:
                `"${common.ParameterEnum.ValueField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
        } else {
          let field = getField({
            model: model,
            fieldId: report.data.value_field
          });

          if (
            field.fieldClass !== common.FieldClassEnum.Measure &&
            field.fieldClass !== common.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.REPORT_DATA_WRONG_VALUE_FIELD_CLASS,
                message: `"${common.ParameterEnum.ValueField}" must be a Measure or Calculation`,
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
        }
      }

      if (common.isDefined(report.data.previous_value_field)) {
        if (report.select.indexOf(report.data.previous_value_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD,
              message:
                `"${common.ParameterEnum.PreviousValueField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
        } else {
          let field = getField({
            model: model,
            fieldId: report.data.previous_value_field
          });

          if (
            field.fieldClass !== common.FieldClassEnum.Measure &&
            field.fieldClass !== common.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD_CLASS,
                message: `"${common.ParameterEnum.PreviousValueField}" must be a Measure or Calculation`,
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
        }
      }

      if (common.isDefined(report.data.y_fields)) {
        if (!Array.isArray(report.data.y_fields)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_Y_FIELDS_MUST_BE_A_LIST,
              message: `parameter "${common.ParameterEnum.YFields}" must be a list`,
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
                title: common.ErTitleEnum.REPORT_DATA_WRONG_Y_FIELDS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${common.ParameterEnum.Select}"`,
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
          } else {
            let field = getField({
              model: model,
              fieldId: element
            });

            if (
              field.fieldClass !== common.FieldClassEnum.Measure &&
              field.fieldClass !== common.FieldClassEnum.Calculation
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum
                      .REPORT_DATA_WRONG_Y_FIELDS_ELEMENT_FIELD_CLASS,
                  message: `"${common.ParameterEnum.YFields}" element must be a Measure or Calculation`,
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
          }
        });
      }

      if (common.isDefined(report.data.hide_columns)) {
        if (!Array.isArray(report.data.hide_columns)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.REPORT_DATA_HIDE_COLUMNS_MUST_BE_A_LIST,
              message: `parameter "${common.ParameterEnum.HideColumns}" must be a list`,
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
                  common.ErTitleEnum.REPORT_DATA_WRONG_HIDE_COLUMNS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${common.ParameterEnum.Select}"`,
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
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}

function getField(item: { model: common.FileModel; fieldId: string }) {
  let { model, fieldId } = item;

  let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
  let r = reg.exec(fieldId);

  let asName = r[1];
  let fieldName = r[2];
  let field =
    asName === constants.MF
      ? model.fields.find(mField => mField.name === fieldName)
      : model.joins
          .find(j => j.as === asName)
          .view.fields.find(f => f.name === fieldName);

  return field;
}
