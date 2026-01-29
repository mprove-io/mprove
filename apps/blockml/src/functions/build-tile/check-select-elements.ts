import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { Model } from '#common/interfaces/blockml/model';
import { dcType } from '#common/types/dc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckSelectElements;

export function checkSelectElements<T extends dcType>(
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

    x.tiles
      .filter(tile => isDefined(tile.select))
      .forEach(tile => {
        let apiModel = item.apiModels.find(y => y.modelId === tile.model);

        tile.select.forEach(element => {
          let modelField = apiModel.fields.find(x => x.id === element);

          if (isUndefined(modelField)) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_WRONG_SELECT_MODEL_FIELD,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
