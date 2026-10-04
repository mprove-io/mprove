import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileChartDataPivotValue } from '#common/types/blockml/parts/internal/file-chart-data-pivot-value';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';

let func: Func = 'build-mconfig-chart/check-chart-data-parameters';

export function checkChartDataParameters<T extends dcType>(item: {
  entities: T[];
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      let apiModel = item.apiModels.find(y => y.modelId === tile.model);

      let store: FileStore;

      if (apiModel.type === 'Store') {
        store = item.stores.find(m => m.name === tile.model);
      }

      if (
        ['pie', 'line', 'bar', 'scatter'].indexOf(tile.type) > -1 &&
        (isUndefined(tile.data) || isUndefined(tile.data.x_field))
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_MISSING_X_FIELD',
            message:
              `tile of type "${tile.type}" must have ` +
              `"x_field" parameter in "data"`,
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
        ['bar', 'line', 'scatter', 'pie', 'single'].indexOf(tile.type) > -1 &&
        (isUndefined(tile.data) || isUndefined(tile.data.y_fields))
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_MISSING_Y_FIELDS',
            message:
              `tile of type "${tile.type}" must have ` +
              `"y_fields" parameter in "data"`,
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
        tile.type === 'pivot_table' &&
        (isUndefined(tile.data) || isUndefined(tile.data.pivot_rows))
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_MISSING_PIVOT_ROWS',
            message:
              `tile of type "${tile.type}" must have ` +
              `"pivot_rows" parameter in "data"`,
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
        tile.type === 'pivot_table' &&
        (isUndefined(tile.data) || isUndefined(tile.data.pivot_columns))
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_MISSING_PIVOT_COLUMNS',
            message:
              `tile of type "${tile.type}" must have ` +
              `"pivot_columns" parameter in "data"`,
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
        tile.type === 'pivot_table' &&
        (isUndefined(tile.data) || isUndefined(tile.data.pivot_values))
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_MISSING_PIVOT_VALUES',
            message:
              `tile of type "${tile.type}" must have ` +
              `"pivot_values" parameter in "data"`,
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

      if (tile.type === 'pivot_table' && tile.data.pivot_values.length === 0) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_PIVOT_VALUES_EMPTY',
            message: `"pivot_values" must have at least one element`,
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
        ['pie', 'single'].indexOf(tile.type) > -1 &&
        tile.data.y_fields.length > 1
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_TOO_MANY_Y_FIELDS',
            message:
              `tile of type "${tile.type}" can have only one element inside ` +
              `"y_fields" list`,
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
        tile.type === 'pivot_table' &&
        (tile.data.pivot_rows || []).length === 0 &&
        (tile.data.pivot_columns || []).length === 0
      ) {
        item.errors.push(
          new BmError({
            title: 'TILE_DATA_PIVOT_ROWS_AND_COLUMNS_EMPTY',
            message:
              `"pivot_rows" and "pivot_columns" ` + 'cannot both be empty',
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
              title: 'TILE_DATA_WRONG_X_FIELD',
              message: `"x_field" value must be one of ` + `"select" elements`,
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
            apiModel.type === 'Store'
              ? store.fields.find(sField => sField.name === tile.data.x_field)
              : apiModel.type === 'Malloy'
                ? apiModel.fields.find(field => field.id === tile.data.x_field)
                : undefined;

          if (field.fieldClass !== 'dimension' && tile.type !== 'scatter') {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_WRONG_X_FIELD_CLASS',
                message: `"x_field" must be a Dimension for this chart type`,
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
              title: 'TILE_DATA_WRONG_SIZE_FIELD',
              message:
                `"size_field" value must be one of ` + `"select" elements`,
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
            apiModel.type === 'Store'
              ? store.fields.find(
                  sField => sField.name === tile.data.size_field
                )
              : apiModel.type === 'Malloy'
                ? apiModel.fields.find(
                    field => field.id === tile.data.size_field
                  )
                : undefined;

          if (field.result !== 'number') {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_WRONG_SIZE_FIELD_RESULT',
                message: `"size_field" result must be a number`,
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
              title: 'TILE_DATA_WRONG_MULTI_FIELD',
              message:
                `"multi_field" value must be one of ` + `"select" elements`,
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
            apiModel.type === 'Store'
              ? store.fields.find(
                  sField => sField.name === tile.data.multi_field
                )
              : apiModel.type === 'Malloy'
                ? apiModel.fields.find(
                    field => field.id === tile.data.multi_field
                  )
                : undefined;

          if (field.fieldClass !== 'dimension') {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_WRONG_MULTI_FIELD_CLASS',
                message: `"multi_field" must be a Dimension`,
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
                title: 'TILE_DATA_WRONG_PIVOT_ROWS_ELEMENT',
                message:
                  `found element "${element}" that is not ` +
                  `listed in "select"`,
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
            apiModel.type === 'Store'
              ? store.fields.find(sField => sField.name === element)
              : apiModel.type === 'Malloy'
                ? apiModel.fields.find(modelField => modelField.id === element)
                : undefined;

          if (field.fieldClass !== 'dimension') {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_WRONG_PIVOT_ROWS_ELEMENT_FIELD_CLASS',
                message: `"pivot_rows" elements must be Dimensions`,
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
                title: 'TILE_DATA_WRONG_PIVOT_COLUMNS_ELEMENT',
                message:
                  `found element "${element}" that is not ` +
                  `listed in "select"`,
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
                title: 'TILE_DATA_DUPLICATE_PIVOT_COLUMNS_ELEMENT',
                message: `"pivot_columns" elements cannot also be used in "pivot_rows"`,
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
            apiModel.type === 'Store'
              ? store.fields.find(sField => sField.name === element)
              : apiModel.type === 'Malloy'
                ? apiModel.fields.find(modelField => modelField.id === element)
                : undefined;

          if (field.fieldClass !== 'dimension') {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_WRONG_PIVOT_COLUMNS_ELEMENT_FIELD_CLASS',
                message: `"pivot_columns" elements must be Dimensions`,
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
                if (['field'.toString()].indexOf(parameter) < 0) {
                  item.errors.push(
                    new BmError({
                      title: 'TILE_DATA_UNKNOWN_PIVOT_VALUES_ELEMENT_PARAMETER',
                      message: `parameter "${parameter}" cannot be used in pivot_values element`,
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
                title: 'TILE_DATA_PIVOT_VALUES_ELEMENT_MISSING_FIELD',
                message: `"field" is required inside "pivot_values" element`,
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
                title: 'TILE_DATA_WRONG_PIVOT_VALUES_ELEMENT_FIELD',
                message:
                  `found element "${element.field}" that is not ` +
                  `listed in "select"`,
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

      if (tile.type === 'pivot_table') {
        let pivotDimensionFields = [
          ...(tile.data.pivot_rows || []),
          ...(tile.data.pivot_columns || [])
        ];
        let pivotValueFields = (tile.data.pivot_values || []).map(
          element => element.field
        );

        tile.select.forEach(element => {
          let field =
            apiModel.type === 'Store'
              ? store.fields.find(sField => sField.name === element)
              : apiModel.type === 'Malloy'
                ? apiModel.fields.find(modelField => modelField.id === element)
                : undefined;

          if (
            field.fieldClass === 'dimension' &&
            pivotDimensionFields.indexOf(element) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  'TILE_DATA_PIVOT_SELECTED_DIMENSION_MISSING_FROM_ROWS_OR_COLUMNS',
                message:
                  `selected Dimension "${element}" must be used in ` +
                  `"pivot_rows" or "pivot_columns"`,
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
            field.fieldClass === 'measure' &&
            pivotValueFields.indexOf(element) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_PIVOT_SELECTED_MEASURE_MISSING_FROM_VALUES',
                message:
                  `selected Measure "${element}" must be used in ` +
                  `"pivot_values"`,
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
              title: 'TILE_DATA_Y_FIELDS_MUST_BE_A_LIST',
              message: `parameter "y_fields" must be a list`,
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
                title: 'TILE_DATA_WRONG_Y_FIELDS_ELEMENT',
                message:
                  `found element "${element}" that is not ` +
                  `listed in "select"`,
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
              apiModel.type === 'Store'
                ? store.fields.find(sField => sField.name === element)
                : apiModel.type === 'Malloy'
                  ? apiModel.fields.find(field => field.id === element)
                  : undefined;

            if (
              field.fieldClass !== 'measure' &&
              field.fieldClass !== 'calculation' &&
              tile.type !== 'scatter'
            ) {
              item.errors.push(
                new BmError({
                  title: 'TILE_DATA_WRONG_Y_FIELDS_ELEMENT_FIELD_CLASS',
                  message: `"y_fields" element must be a Measure or Calculation for this chart type`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
