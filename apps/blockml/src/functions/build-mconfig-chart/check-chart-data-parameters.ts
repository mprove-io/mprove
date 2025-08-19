import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { dcType } from '~common/types/dc-type';
import { log } from '../extra/log';

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

      // if (isUndefined(model)) {
      //   console.log('tile.model');
      //   console.log(tile.model);
      //   console.log('models');
      //   console.log(models.map(y => y.model));
      // }

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

      if (isDefined(tile.data.hide_columns)) {
        if (!Array.isArray(tile.data.hide_columns)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_DATA_HIDE_COLUMNS_MUST_BE_A_LIST,
              message: `parameter "${ParameterEnum.HideColumns}" must be a list`,
              lines: [
                {
                  line: tile.data.hide_columns_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        tile.data.hide_columns.forEach(element => {
          if (tile.select.indexOf(element) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_WRONG_HIDE_COLUMNS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${ParameterEnum.Select}"`,
                lines: [
                  {
                    line: tile.data.hide_columns_line_num,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
