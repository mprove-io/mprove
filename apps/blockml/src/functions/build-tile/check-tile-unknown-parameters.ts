import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { MyRegex } from '~common/models/my-regex';
import { dcType } from '~common/types/dc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckTileUnknownParameters;

export function checkTileUnknownParameters<T extends dcType>(
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
      Object.keys(tile)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.Title.toString(),
              ParameterEnum.Description.toString(),
              ParameterEnum.Query.toString(),
              ParameterEnum.Model.toString(),
              ParameterEnum.Select.toString(),
              ParameterEnum.Sorts.toString(),
              ParameterEnum.Limit.toString(),
              ParameterEnum.Type.toString(),
              ParameterEnum.Parameters.toString(),
              ParameterEnum.Data.toString(),
              ParameterEnum.Options.toString(),
              ParameterEnum.Plate.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNKNOWN_TILE_PARAMETER,
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
            [
              ParameterEnum.Select.toString(),
              ParameterEnum.Parameters.toString()
            ].indexOf(parameter) < 0 &&
            Array.isArray(tile[parameter as keyof FilePartTile])
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_LIST_IN_TILE_PARAMETERS,
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
              ParameterEnum.Data.toString(),
              ParameterEnum.Options.toString(),
              ParameterEnum.Plate.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNEXPECTED_DICTIONARY_IN_TILE_PARAMETERS,
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
            [
              ParameterEnum.Select.toString(),
              ParameterEnum.Parameters.toString()
            ].indexOf(parameter) > -1 &&
            !Array.isArray(tile[parameter as keyof FilePartTile])
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_PARAMETER_MUST_BE_A_LIST,
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
              ParameterEnum.Data.toString(),
              ParameterEnum.Options.toString(),
              ParameterEnum.Plate.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.TILE_PARAMETER_MUST_BE_A_DICTIONARY,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
