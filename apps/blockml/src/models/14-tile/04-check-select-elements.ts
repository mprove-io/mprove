import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/constants/top';

let func = common.FuncEnum.CheckSelectElements;

export function checkSelectElements<T extends types.dzType>(
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
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles
      .filter(tile => common.isDefined(tile.select))
      .forEach(tile => {
        let isStore =
          common.isDefined(tile.model) &&
          tile.model.startsWith(STORE_MODEL_PREFIX);

        let model: common.FileModel;
        let store: common.FileStore;

        let apiModel = item.apiModels.find(y => y.modelId === tile.model);

        if (apiModel.type === common.ModelTypeEnum.Store) {
          store = item.stores.find(
            m => `${STORE_MODEL_PREFIX}_${m.name}` === tile.model
          );
        } else if (apiModel.type === common.ModelTypeEnum.SQL) {
          model = item.models.find(m => m.name === tile.model);
        }

        tile.select.forEach(element => {
          if (apiModel.type === common.ModelTypeEnum.SQL) {
            let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
            let r = reg.exec(element);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TILE_WRONG_SELECT_ELEMENT,
                  message: `found element "${element}" that cannot be parsed as "alias.field_name"`,
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

            let asName = r[1];
            let fieldName = r[2];

            if (asName === common.MF) {
              let modelField = model.fields.find(
                mField => mField.name === fieldName
              );

              if (common.isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.TILE_WRONG_SELECT_MODEL_FIELD,
                    message:
                      `found element "${element}" references missing or not valid field ` +
                      `"${fieldName}" of model "${model.name}" fields section`,
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
            } else {
              let join = model.joins.find(j => j.as === asName);

              if (common.isUndefined(join)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.TILE_WRONG_SELECT_ALIAS,
                    message:
                      `found element "${element}" references missing alias ` +
                      `"${asName}" of model "${model.name}" joins section `,
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

              let viewField = join.view.fields.find(f => f.name === fieldName);

              if (common.isUndefined(viewField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.TILE_WRONG_SELECT_VIEW_FIELD,
                    message:
                      `found element "${element}" references missing or not valid field ` +
                      `"${fieldName}" of view "${join.view.name}" fields section. ` +
                      `View has "${asName}" alias in "${model.name}" model.`,
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
            }
          } else if (
            apiModel.type === common.ModelTypeEnum.Malloy ||
            apiModel.type === common.ModelTypeEnum.Store
          ) {
            let modelField = apiModel.fields.find(x => x.id === element);

            if (common.isUndefined(modelField)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TILE_WRONG_SELECT_MODEL_FIELD,
                  message: `found element "${element}" references missing or not valid field`,
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
          }
        });
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
