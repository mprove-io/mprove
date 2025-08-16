import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckSelectElements;

export function checkSelectElements<T extends types.dzType>(
  item: {
    entities: T[];
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
        let apiModel = item.apiModels.find(y => y.modelId === tile.model);

        tile.select.forEach(element => {
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
