import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartData;

export function checkChartData<T extends types.dcType>(
  item: {
    entities: T[];
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
      if (common.isUndefined(tile.data)) {
        return;
      }

      Object.keys(tile.data)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.HideColumns.toString(),
              common.ParameterEnum.XField.toString(),
              common.ParameterEnum.YFields.toString(),
              common.ParameterEnum.SizeField.toString(),
              common.ParameterEnum.MultiField.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_DATA_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  'inside Tile Data',
                lines: [
                  {
                    line: tile.data[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartData
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(
              tile.data[parameter as keyof common.FileChartData] as any
            ) &&
            [
              common.ParameterEnum.YFields.toString(),
              common.ParameterEnum.HideColumns.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_DATA_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a List`,
                lines: [
                  {
                    line: tile.data[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartData
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            (tile.data[parameter as keyof common.FileChartData] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_DATA_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a Dictionary`,
                lines: [
                  {
                    line: tile.data[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartData
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
