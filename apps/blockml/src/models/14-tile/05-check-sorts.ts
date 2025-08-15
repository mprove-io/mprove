import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/constants/top';

let func = common.FuncEnum.CheckSorts;

export function checkSorts<T extends types.dzType>(
  item: {
    entities: T[];
    apiModels: common.Model[];
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

    x.tiles.forEach(tile => {
      let apiModel = item.apiModels.find(x => x.modelId === tile.model);

      tile.sortingsAry = [];

      if (common.isUndefined(tile.sorts)) {
        return;
      }

      let isStore =
        common.isDefined(tile.model) &&
        tile.model.startsWith(STORE_MODEL_PREFIX);

      tile.sorts.split(',').forEach(part => {
        let reg =
          apiModel.type === common.ModelTypeEnum.Store
            ? common.MyRegex.CAPTURE_STORE_SORT_WITH_OPTIONAL_DESC_G()
            : common.MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G();

        let r = reg.exec(part);

        if (common.isUndefined(r)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TILE_WRONG_SORTS_SYNTAX,
              message:
                isStore === true
                  ? `Store Model "${common.ParameterEnum.Sorts}" can contain selected ` +
                    'fields in form of "field_name [desc]" separated by comma'
                  : `Model "${common.ParameterEnum.Sorts}" can contain selected ` +
                    'fields in form of "alias.field_name [desc]" separated by comma',
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
              title: common.ErTitleEnum.TILE_SORTS_REFS_UNSELECTED_FIELD,
              message:
                'Only selected fields can be sorted.' +
                `Found field "${sorter}" in "${common.ParameterEnum.Sorts}" that ` +
                `is not in "${common.ParameterEnum.Select}". `,
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
          desc: common.isDefined(desc)
        });
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
