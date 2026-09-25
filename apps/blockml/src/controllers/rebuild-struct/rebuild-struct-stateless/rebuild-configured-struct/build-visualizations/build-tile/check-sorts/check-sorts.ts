import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { dcType } from '#common/types/dc-type';
import type { Model } from '#common/zod/blockml/model';

let func = FuncEnum.CheckSorts;

export function checkSorts<T extends dcType>(item: {
  entities: T[];
  apiModels: Model[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      let apiModel = item.apiModels.find(x => x.modelId === tile.model);

      tile.sortingsAry = [];

      if (isUndefined(tile.sorts)) {
        return;
      }

      tile.sorts.split(',').forEach(part => {
        let reg = MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G();

        let r = reg.exec(part);

        if (isUndefined(r)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_WRONG_SORTS_SYNTAX,
              message:
                `Model "${ParameterEnum.Sorts}" can contain selected ` +
                'fields in form of "field_path [desc]" separated by comma',
              lines: [
                {
                  line: tile.sorts_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        let sorter = r[1];
        let desc = r[2];

        if (tile.select.findIndex(y => y === sorter) < 0) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TILE_SORTS_REFS_UNSELECTED_FIELD,
              message:
                'Only selected fields can be sorted.' +
                `Found field "${sorter}" in "${ParameterEnum.Sorts}" that ` +
                `is not in "${ParameterEnum.Select}". `,
              lines: [
                {
                  line: tile.sorts_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        tile.sortingsAry.push({
          fieldId: sorter,
          desc: isDefined(desc)
        });
      });
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return Result.succeed(newEntities);
}
