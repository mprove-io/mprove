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
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileChartData } from '#common/types/blockml/parts/internal/file-chart-data';

let func: Func = 'build-mconfig-chart/check-chart-data';

export function checkChartData<T extends dcType>(item: {
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
      if (isUndefined(tile.data)) {
        return;
      }

      let allowedParameters =
        tile.type === 'pivot_table'
          ? [
              'pivot_rows'.toString(),
              'pivot_columns'.toString(),
              'pivot_values'.toString()
            ]
          : [
              'x_field'.toString(),
              'y_fields'.toString(),
              'size_field'.toString(),
              'multi_field'.toString()
            ];

      Object.keys(tile.data)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (allowedParameters.indexOf(parameter) < 0) {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_UNKNOWN_PARAMETER',
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
              'y_fields'.toString(),
              'pivot_rows'.toString(),
              'pivot_columns'.toString(),
              'pivot_values'.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'TILE_DATA_UNEXPECTED_LIST',
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
                title: 'TILE_DATA_UNEXPECTED_DICTIONARY',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
