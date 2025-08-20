import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { FileChartData } from '~common/interfaces/blockml/internal/file-chart-data';
import { MyRegex } from '~common/models/my-regex';
import { dcType } from '~common/types/dc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartData;

export function checkChartData<T extends dcType>(
  item: {
    entities: T[];
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
      if (isUndefined(tile.data)) {
        return;
      }

      Object.keys(tile.data)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.HideColumns.toString(),
              ParameterEnum.XField.toString(),
              ParameterEnum.YFields.toString(),
              ParameterEnum.SizeField.toString(),
              ParameterEnum.MultiField.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  'inside Tile Data',
                lines: [
                  {
                    line: tile.data[
                      (parameter + LINE_NUM) as keyof FileChartData
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
            Array.isArray(tile.data[parameter as keyof FileChartData] as any) &&
            [
              ParameterEnum.YFields.toString(),
              ParameterEnum.HideColumns.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a List`,
                lines: [
                  {
                    line: tile.data[
                      (parameter + LINE_NUM) as keyof FileChartData
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
            (tile.data[parameter as keyof FileChartData] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_DATA_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a Dictionary`,
                lines: [
                  {
                    line: tile.data[
                      (parameter + LINE_NUM) as keyof FileChartData
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
