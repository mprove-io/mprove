import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/_index';

let func = common.FuncEnum.CheckChartDataParameters;

export function checkChartDataParameters<T extends types.dzType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    apiModels: common.Model[];
    stores: common.FileStore[];
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

    x.tiles.forEach(tile => {
      let apiModel = item.apiModels.find(y => y.modelId === tile.model);

      // let isStore =
      //   common.isDefined(tile.model) &&
      //   tile.model.startsWith(STORE_MODEL_PREFIX);

      let model: common.FileModel;
      let store: common.FileStore;

      if (apiModel.type === common.ModelTypeEnum.Store) {
        store = item.stores.find(
          m => `${STORE_MODEL_PREFIX}_${m.name}` === tile.model
        );
      } else {
        model = item.models.find(m => m.name === tile.model);
      }

      // if (common.isUndefined(model)) {
      //   console.log('tile.model');
      //   console.log(tile.model);
      //   console.log('models');
      //   console.log(models.map(y => y.model));
      // }

      if (
        [
          common.ChartTypeEnum.Pie,
          common.ChartTypeEnum.Line,
          common.ChartTypeEnum.Bar,
          common.ChartTypeEnum.Scatter
        ].indexOf(tile.type) > -1 &&
        (common.isUndefined(tile.data) || common.isUndefined(tile.data.x_field))
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TILE_DATA_MISSING_X_FIELD,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${common.ParameterEnum.XField}" parameter in "${common.ParameterEnum.Data}"`,
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
          common.ChartTypeEnum.Bar,
          common.ChartTypeEnum.Line,
          common.ChartTypeEnum.Scatter,
          common.ChartTypeEnum.Pie,
          common.ChartTypeEnum.Single
        ].indexOf(tile.type) > -1 &&
        (common.isUndefined(tile.data) ||
          common.isUndefined(tile.data.y_fields))
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TILE_DATA_MISSING_Y_FIELDS,
            message:
              `tile of type "${tile.type}" must have ` +
              `"${common.ParameterEnum.YFields}" parameter in "${common.ParameterEnum.Data}"`,
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
        [common.ChartTypeEnum.Pie, common.ChartTypeEnum.Single].indexOf(
          tile.type
        ) > -1 &&
        tile.data.y_fields.length > 1
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TILE_DATA_TOO_MANY_Y_FIELDS,
            message:
              `tile of type "${tile.type}" can have only one element inside ` +
              `"${common.ParameterEnum.YFields}" list`,
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

      if (common.isUndefined(tile.data)) {
        return;
      }

      if (common.isDefined(tile.data.x_field)) {
        if (tile.select.indexOf(tile.data.x_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_DATA_WRONG_X_FIELD,
              message:
                `"${common.ParameterEnum.XField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
            apiModel.type === common.ModelTypeEnum.Store
              ? store.fields.find(sField => sField.name === tile.data.x_field)
              : apiModel.type === common.ModelTypeEnum.Malloy
                ? apiModel.fields.find(field => field.id === tile.data.x_field)
                : getModelField({
                    model: model,
                    fieldId: tile.data.x_field
                  });

          if (
            field.fieldClass !== common.FieldClassEnum.Dimension &&
            tile.type !== common.ChartTypeEnum.Scatter
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_DATA_WRONG_X_FIELD_CLASS,
                message: `"${common.ParameterEnum.XField}" must be a Dimension for this chart type`,
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

      if (common.isDefined(tile.data.size_field)) {
        if (tile.select.indexOf(tile.data.size_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_DATA_WRONG_SIZE_FIELD,
              message:
                `"${common.ParameterEnum.SizeField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
            apiModel.type === common.ModelTypeEnum.Store
              ? store.fields.find(
                  sField => sField.name === tile.data.size_field
                )
              : apiModel.type === common.ModelTypeEnum.Malloy
                ? apiModel.fields.find(
                    field => field.id === tile.data.size_field
                  )
                : getModelField({
                    model: model,
                    fieldId: tile.data.size_field
                  });

          if (field.result !== common.FieldResultEnum.Number) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_DATA_WRONG_SIZE_FIELD_RESULT,
                message: `"${common.ParameterEnum.SizeField}" result must be a number`,
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

      if (common.isDefined(tile.data.multi_field)) {
        if (tile.select.indexOf(tile.data.multi_field) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_DATA_WRONG_MULTI_FIELD,
              message:
                `"${common.ParameterEnum.MultiField}" value must be one of ` +
                `"${common.ParameterEnum.Select}" elements`,
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
            apiModel.type === common.ModelTypeEnum.Store
              ? store.fields.find(
                  sField => sField.name === tile.data.multi_field
                )
              : apiModel.type === common.ModelTypeEnum.Malloy
                ? apiModel.fields.find(
                    field => field.id === tile.data.multi_field
                  )
                : getModelField({
                    model: model,
                    fieldId: tile.data.multi_field
                  });

          if (field.fieldClass !== common.FieldClassEnum.Dimension) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_DATA_WRONG_MULTI_FIELD_CLASS,
                message: `"${common.ParameterEnum.MultiField}" must be a Dimension`,
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

      if (common.isDefined(tile.data.y_fields)) {
        if (!Array.isArray(tile.data.y_fields)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_DATA_Y_FIELDS_MUST_BE_A_LIST,
              message: `parameter "${common.ParameterEnum.YFields}" must be a list`,
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
                title: common.ErTitleEnum.TILE_DATA_WRONG_Y_FIELDS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${common.ParameterEnum.Select}"`,
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
              apiModel.type === common.ModelTypeEnum.Store
                ? store.fields.find(sField => sField.name === element)
                : apiModel.type === common.ModelTypeEnum.Malloy
                  ? apiModel.fields.find(field => field.id === element)
                  : getModelField({
                      model: model,
                      fieldId: element
                    });

            if (
              field.fieldClass !== common.FieldClassEnum.Measure &&
              field.fieldClass !== common.FieldClassEnum.Calculation &&
              tile.type !== common.ChartTypeEnum.Scatter
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum
                      .TILE_DATA_WRONG_Y_FIELDS_ELEMENT_FIELD_CLASS,
                  message: `"${common.ParameterEnum.YFields}" element must be a Measure or Calculation for this chart type`,
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

      if (common.isDefined(tile.data.hide_columns)) {
        if (!Array.isArray(tile.data.hide_columns)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_DATA_HIDE_COLUMNS_MUST_BE_A_LIST,
              message: `parameter "${common.ParameterEnum.HideColumns}" must be a list`,
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
                title: common.ErTitleEnum.TILE_DATA_WRONG_HIDE_COLUMNS_ELEMENT,
                message:
                  `found element "${element}" that is not ` +
                  `listed in "${common.ParameterEnum.Select}"`,
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

function getModelField(item: { model: common.FileModel; fieldId: string }) {
  let { model, fieldId } = item;

  let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
  let r = reg.exec(fieldId);

  let asName = r[1];
  let fieldName = r[2];

  let field =
    asName === common.MF
      ? model.fields.find(mField => mField.name === fieldName)
      : model.joins
          .find(j => j.as === asName)
          .view.fields.find(f => f.name === fieldName);

  return field;
}
