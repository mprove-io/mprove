import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { dcType } from '#common/types/dc-type';
import type { FileChartDataPivotValue } from '#common/zod/blockml/internal/file-chart-data-pivot-value';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';

let func = FuncEnum.CheckChartDataParameters;

export function checkChartDataParameters<T extends dcType>(
  item: {
    entities: T[];
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      let apiModel = item.apiModels.find(y => y.modelId === tile.model);

      let store: FileStore;

      if (apiModel.type === ModelTypeEnum.Store) {
        store = item.stores.find(m => m.name === tile.model);
      }

      if (
        [
          ChartTypeEnum.Pie,
          ChartTypeEnum.Line,
          ChartTypeEnum.Bar,
          ChartTypeEnum.Scatter
        ].indexOf(tile.type) > -1 &&
        (isUndefined(tile.data) || isUndefined(tile.data.x_field))
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_MISSING_X_FIELD,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${ParameterEnum.XField}" parameter in "${ParameterEnum.Data}"`,
            lines: [
              {
                line: tile.data_line_num,
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
          ChartTypeEnum.Bar,
          ChartTypeEnum.Line,
          ChartTypeEnum.Scatter,
          ChartTypeEnum.Pie,
          ChartTypeEnum.Single
        ].indexOf(tile.type) > -1 &&
        (isUndefined(tile.data) || isUndefined(tile.data.y_fields))
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_MISSING_Y_FIELDS,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${ParameterEnum.YFields}" parameter in "${ParameterEnum.Data}"`,
            lines: [
              {
                line: tile.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        tile.type === ChartTypeEnum.PivotTable &&
        (isUndefined(tile.data) || isUndefined(tile.data.pivot_rows))
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_MISSING_PIVOT_ROWS,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${ParameterEnum.PivotRows}" parameter in "${ParameterEnum.Data}"`,
            lines: [
              {
                line: tile.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        tile.type === ChartTypeEnum.PivotTable &&
        (isUndefined(tile.data) || isUndefined(tile.data.pivot_columns))
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_MISSING_PIVOT_COLUMNS,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${ParameterEnum.PivotColumns}" parameter in "${ParameterEnum.Data}"`,
            lines: [
              {
                line: tile.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        tile.type === ChartTypeEnum.PivotTable &&
        (isUndefined(tile.data) || isUndefined(tile.data.pivot_values))
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_MISSING_PIVOT_VALUES,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${ParameterEnum.PivotValues}" parameter in "${ParameterEnum.Data}"`,
            lines: [
              {
                line: tile.data_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        tile.type === ChartTypeEnum.PivotTable &&
        tile.data.pivot_values.length === 0
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_PIVOT_VALUES_EMPTY,
            message: `"${ParameterEnum.PivotValues}" must have at least one element`,
            lines: [
              {
                line: tile.data.pivot_values_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        [ChartTypeEnum.Pie, ChartTypeEnum.Single].indexOf(tile.type) > -1 &&
        tile.data.y_fields.length > 1
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_TOO_MANY_Y_FIELDS,
            message:
              `tile of type "${tile.type}" can have only one element inside ` +
              `"${ParameterEnum.YFields}" list`,
            lines: [
              {
                line: tile.data.y_fields_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (isUndefined(tile.data)) {
        return;
      }

      if (
        tile.type === ChartTypeEnum.PivotTable &&
        (tile.data.pivot_rows || []).length === 0 &&
        (tile.data.pivot_columns || []).length === 0
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TILE_DATA_PIVOT_ROWS_AND_COLUMNS_EMPTY,
            message:
              `"${ParameterEnum.PivotRows}" and "${ParameterEnum.PivotColumns}" ` +
              'cannot both be empty',
            lines: [
              {
                line: tile.data.pivot_rows_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (isDefined(tile.data.x_field)) {
        if (tile.select.indexOf(tile.data.x_field) < 0) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_DATA_WRONG_X_FIELD,
              message:
                `"${ParameterEnum.XField}" value must be one of ` +
                `"${ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: tile.data.x_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else {
          let field =
            apiModel.type === ModelTypeEnum.Store
              ? store.fields.find(sField => sField.name === tile.data.x_field)
              : apiModel.type === ModelTypeEnum.Malloy
                ? apiModel.fields.find(field => field.id === tile.data.x_field)
                : undefined;

          if (
            field.fieldClass !== FieldClassEnum.Dimension &&
            tile.type !== ChartTypeEnum.Scatter
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_X_FIELD_CLASS,
                message: `"${ParameterEnum.XField}" must be a Dimension for this chart type`,
                lines: [
                  {
                    line: tile.data.x_field_line_num,
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

      if (isDefined(tile.data.size_field)) {
        if (tile.select.indexOf(tile.data.size_field) < 0) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_DATA_WRONG_SIZE_FIELD,
              message:
                `"${ParameterEnum.SizeField}" value must be one of ` +
                `"${ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: tile.data.size_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else {
          let field =
            apiModel.type === ModelTypeEnum.Store
              ? store.fields.find(
                  sField => sField.name === tile.data.size_field
                )
              : apiModel.type === ModelTypeEnum.Malloy
                ? apiModel.fields.find(
                    field => field.id === tile.data.size_field
                  )
                : undefined;

          if (field.result !== FieldResultEnum.Number) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_SIZE_FIELD_RESULT,
                message: `"${ParameterEnum.SizeField}" result must be a number`,
                lines: [
                  {
                    line: tile.data.size_field_line_num,
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

      if (isDefined(tile.data.multi_field)) {
        if (tile.select.indexOf(tile.data.multi_field) < 0) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_DATA_WRONG_MULTI_FIELD,
              message:
                `"${ParameterEnum.MultiField}" value must be one of ` +
                `"${ParameterEnum.Select}" elements`,
              lines: [
                {
                  line: tile.data.multi_field_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else {
          let field =
            apiModel.type === ModelTypeEnum.Store
              ? store.fields.find(
                  sField => sField.name === tile.data.multi_field
                )
              : apiModel.type === ModelTypeEnum.Malloy
                ? apiModel.fields.find(
                    field => field.id === tile.data.multi_field
                  )
                : undefined;

          if (field.fieldClass !== FieldClassEnum.Dimension) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_MULTI_FIELD_CLASS,
                message: `"${ParameterEnum.MultiField}" must be a Dimension`,
                lines: [
                  {
                    line: tile.data.multi_field_line_num,
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

      if (isDefined(tile.data.pivot_rows)) {
        tile.data.pivot_rows.forEach(element => {
          if (tile.select.indexOf(element) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_PIVOT_ROWS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${ParameterEnum.Select}"`,
                lines: [
                  {
                    line: tile.data.pivot_rows_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          let field =
            apiModel.type === ModelTypeEnum.Store
              ? store.fields.find(sField => sField.name === element)
              : apiModel.type === ModelTypeEnum.Malloy
                ? apiModel.fields.find(modelField => modelField.id === element)
                : undefined;

          if (field.fieldClass !== FieldClassEnum.Dimension) {
            item.errors.push(
              new BmError({
                title:
                  ErTitleEnum.TILE_DATA_WRONG_PIVOT_ROWS_ELEMENT_FIELD_CLASS,
                message: `"${ParameterEnum.PivotRows}" elements must be Dimensions`,
                lines: [
                  {
                    line: tile.data.pivot_rows_line_num,
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

      if (isDefined(tile.data.pivot_columns)) {
        tile.data.pivot_columns.forEach(element => {
          if (tile.select.indexOf(element) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_PIVOT_COLUMNS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${ParameterEnum.Select}"`,
                lines: [
                  {
                    line: tile.data.pivot_columns_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (tile.data.pivot_rows?.indexOf(element) > -1) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_DUPLICATE_PIVOT_COLUMNS_ELEMENT,
                message: `"${ParameterEnum.PivotColumns}" elements cannot also be used in "${ParameterEnum.PivotRows}"`,
                lines: [
                  {
                    line: tile.data.pivot_columns_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          let field =
            apiModel.type === ModelTypeEnum.Store
              ? store.fields.find(sField => sField.name === element)
              : apiModel.type === ModelTypeEnum.Malloy
                ? apiModel.fields.find(modelField => modelField.id === element)
                : undefined;

          if (field.fieldClass !== FieldClassEnum.Dimension) {
            item.errors.push(
              new BmError({
                title:
                  ErTitleEnum.TILE_DATA_WRONG_PIVOT_COLUMNS_ELEMENT_FIELD_CLASS,
                message: `"${ParameterEnum.PivotColumns}" elements must be Dimensions`,
                lines: [
                  {
                    line: tile.data.pivot_columns_line_num,
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

      if (isDefined(tile.data.pivot_values)) {
        tile.data.pivot_values.forEach(element => {
          if (element?.constructor === Object) {
            Object.keys(element)
              .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
              .forEach(parameter => {
                if ([ParameterEnum.Field.toString()].indexOf(parameter) < 0) {
                  item.errors.push(
                    new BmError({
                      title:
                        ErTitleEnum.TILE_DATA_UNKNOWN_PIVOT_VALUES_ELEMENT_PARAMETER,
                      message: `parameter "${parameter}" cannot be used in ${ParameterEnum.PivotValues} element`,
                      lines: [
                        {
                          line: element[
                            (parameter +
                              LINE_NUM) as keyof FileChartDataPivotValue
                          ] as number,
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

          if (isUndefined(element.field)) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_PIVOT_VALUES_ELEMENT_MISSING_FIELD,
                message: `"${ParameterEnum.Field}" is required inside "${ParameterEnum.PivotValues}" element`,
                lines: [
                  {
                    line: tile.data.pivot_values_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (tile.select.indexOf(element.field) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_PIVOT_VALUES_ELEMENT_FIELD,
                message:
                  `found element "${element.field}" that is not ` +
                  `listed in "${ParameterEnum.Select}"`,
                lines: [
                  {
                    line:
                      element.field_line_num || tile.data.pivot_values_line_num,
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

      if (tile.type === ChartTypeEnum.PivotTable) {
        let pivotDimensionFields = [
          ...(tile.data.pivot_rows || []),
          ...(tile.data.pivot_columns || [])
        ];
        let pivotValueFields = (tile.data.pivot_values || []).map(
          element => element.field
        );

        tile.select.forEach(element => {
          let field =
            apiModel.type === ModelTypeEnum.Store
              ? store.fields.find(sField => sField.name === element)
              : apiModel.type === ModelTypeEnum.Malloy
                ? apiModel.fields.find(modelField => modelField.id === element)
                : undefined;

          if (
            field.fieldClass === FieldClassEnum.Dimension &&
            pivotDimensionFields.indexOf(element) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  ErTitleEnum.TILE_DATA_PIVOT_SELECTED_DIMENSION_MISSING_FROM_ROWS_OR_COLUMNS,
                message:
                  `selected Dimension "${element}" must be used in ` +
                  `"${ParameterEnum.PivotRows}" or "${ParameterEnum.PivotColumns}"`,
                lines: [
                  {
                    line: tile.select_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            field.fieldClass === FieldClassEnum.Measure &&
            pivotValueFields.indexOf(element) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  ErTitleEnum.TILE_DATA_PIVOT_SELECTED_MEASURE_MISSING_FROM_VALUES,
                message:
                  `selected Measure "${element}" must be used in ` +
                  `"${ParameterEnum.PivotValues}"`,
                lines: [
                  {
                    line: tile.select_line_num,
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

      if (isDefined(tile.data.y_fields)) {
        if (!Array.isArray(tile.data.y_fields)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_DATA_Y_FIELDS_MUST_BE_A_LIST,
              message: `parameter "${ParameterEnum.YFields}" must be a list`,
              lines: [
                {
                  line: tile.data.y_fields_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        tile.data.y_fields.forEach(element => {
          if (tile.select.indexOf(element) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_Y_FIELDS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${ParameterEnum.Select}"`,
                lines: [
                  {
                    line: tile.data.y_fields_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          } else {
            let field =
              apiModel.type === ModelTypeEnum.Store
                ? store.fields.find(sField => sField.name === element)
                : apiModel.type === ModelTypeEnum.Malloy
                  ? apiModel.fields.find(field => field.id === element)
                  : undefined;

            if (
              field.fieldClass !== FieldClassEnum.Measure &&
              field.fieldClass !== FieldClassEnum.Calculation &&
              tile.type !== ChartTypeEnum.Scatter
            ) {
              item.errors.push(
                new BmError({
                  title:
                    ErTitleEnum.TILE_DATA_WRONG_Y_FIELDS_ELEMENT_FIELD_CLASS,
                  message: `"${ParameterEnum.YFields}" element must be a Measure or Calculation for this chart type`,
                  lines: [
                    {
                      line: tile.data.y_fields_line_num,
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
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
