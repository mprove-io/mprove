import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';

let func: Func = 'build-tile/check-tile-unknown-parameters';

export function checkTileUnknownParameters<T extends dcType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = item;

  log(cs, caller, func, structId, 'input.log', input);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      Object.keys(tile)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              'title'.toString(),
              'description'.toString(),
              'query'.toString(),
              'model'.toString(),
              'select'.toString(),
              'sorts'.toString(),
              'limit'.toString(),
              'type'.toString(),
              'parameters'.toString(),
              'data'.toString(),
              'options'.toString(),
              'plate'.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'UNKNOWN_TILE_PARAMETER',
                message: `parameter "${parameter}" cannot be used inside Tile`,
                lines: [
                  {
                    line: tile[
                      (parameter + LINE_NUM) as keyof FilePartTile
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
            ['select'.toString(), 'parameters'.toString()].indexOf(parameter) <
              0 &&
            Array.isArray(tile[parameter as keyof FilePartTile])
          ) {
            item.errors.push(
              new BmError({
                title: 'UNEXPECTED_LIST_IN_TILE_PARAMETERS',
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile[
                      (parameter + LINE_NUM) as keyof FilePartTile
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
            tile[parameter as keyof FilePartTile]?.constructor === Object &&
            [
              'data'.toString(),
              'options'.toString(),
              'plate'.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'UNEXPECTED_DICTIONARY_IN_TILE_PARAMETERS',
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile[
                      (parameter + LINE_NUM) as keyof FilePartTile
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
            ['select'.toString(), 'parameters'.toString()].indexOf(parameter) >
              -1 &&
            !Array.isArray(tile[parameter as keyof FilePartTile])
          ) {
            item.errors.push(
              new BmError({
                title: 'TILE_PARAMETER_MUST_BE_A_LIST',
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: tile[
                      (parameter + LINE_NUM) as keyof FilePartTile
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
            isDefined(tile[parameter as keyof FilePartTile]) &&
            tile[parameter as keyof FilePartTile].constructor !== Object &&
            [
              'data'.toString(),
              'options'.toString(),
              'plate'.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: 'TILE_PARAMETER_MUST_BE_A_DICTIONARY',
                message: `parameter "${parameter}" must be a dictionary`,
                lines: [
                  {
                    line: tile[
                      (parameter + LINE_NUM) as keyof FilePartTile
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
