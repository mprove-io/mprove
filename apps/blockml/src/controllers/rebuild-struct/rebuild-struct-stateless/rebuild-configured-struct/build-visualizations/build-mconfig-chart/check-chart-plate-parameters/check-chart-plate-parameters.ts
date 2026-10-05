import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileChartPlate } from '#common/types/blockml/parts/internal/file-chart-plate';

const allowedPlateParameters = [
  'plate_width',
  'plate_height',
  'plate_x',
  'plate_y'
] satisfies FileParameter[];

let func: Func = 'build-mconfig-chart/check-chart-plate-parameters';

export function checkChartPlateParameters<T extends dcType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

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
            allowedPlateParameters.findIndex(
              candidate => candidate === parameter
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'TILE_PLATE_UNKNOWN_PARAMETER',
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
                title: 'TILE_PLATE_UNEXPECTED_LIST',
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
                title: 'TILE_PLATE_UNEXPECTED_DICTIONARY',
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
            allowedPlateParameters.some(candidate => candidate === parameter) &&
            !(tile.plate[parameter as keyof FileChartPlate] as any).match(
              MyRegex.CAPTURE_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title: 'TILE_PLATE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
