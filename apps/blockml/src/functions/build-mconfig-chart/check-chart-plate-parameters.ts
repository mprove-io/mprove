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
import { FileChartPlate } from '~common/interfaces/blockml/internal/file-chart-plate';
import { MyRegex } from '~common/models/my-regex';
import { dcType } from '~common/types/dc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartPlateParameters;

export function checkChartPlateParameters<T extends dcType>(
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
      if (isUndefined(tile.plate)) {
        return;
      }

      Object.keys(tile.plate)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.PlateWidth.toString(),
              ParameterEnum.PlateHeight.toString(),
              ParameterEnum.PlateX.toString(),
              ParameterEnum.PlateY.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_PLATE_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  'inside Tile plate',
                lines: [
                  {
                    line: tile.plate[
                      (parameter + LINE_NUM) as keyof FileChartPlate
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
            Array.isArray(tile.plate[parameter as keyof FileChartPlate] as any)
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_PLATE_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile.plate[
                      (parameter + LINE_NUM) as keyof FileChartPlate
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
            (tile.plate[parameter as keyof FileChartPlate] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_PLATE_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile.plate[
                      (parameter + LINE_NUM) as keyof FileChartPlate
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
            [
              ParameterEnum.PlateWidth.toString(),
              ParameterEnum.PlateHeight.toString(),
              ParameterEnum.PlateX.toString(),
              ParameterEnum.PlateY.toString()
            ].indexOf(parameter) > -1 &&
            !(tile.plate[parameter as keyof FileChartPlate] as any).match(
              MyRegex.CAPTURE_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title:
                  ErTitleEnum.TILE_PLATE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${
                    tile.plate[parameter as keyof FileChartPlate] as any
                  }" is not valid ` + `${parameter} value`,
                lines: [
                  {
                    line: tile.plate[
                      (parameter + LINE_NUM) as keyof FileChartPlate
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
