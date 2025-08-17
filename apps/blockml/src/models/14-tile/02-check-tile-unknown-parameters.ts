import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckTileUnknownParameters;

export function checkTileUnknownParameters<T extends types.dcType>(
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
      Object.keys(tile)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.Title.toString(),
              common.ParameterEnum.Description.toString(),
              common.ParameterEnum.Query.toString(),
              common.ParameterEnum.Model.toString(),
              common.ParameterEnum.Select.toString(),
              common.ParameterEnum.Sorts.toString(),
              common.ParameterEnum.Limit.toString(),
              common.ParameterEnum.Type.toString(),
              common.ParameterEnum.Parameters.toString(),
              common.ParameterEnum.Data.toString(),
              // common.ParameterEnum.Axis.toString(),
              common.ParameterEnum.Options.toString(),
              common.ParameterEnum.Plate.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_TILE_PARAMETER,
                message: `parameter "${parameter}" cannot be used inside Tile`,
                lines: [
                  {
                    line: tile[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartTile
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
              common.ParameterEnum.Select.toString(),
              common.ParameterEnum.Parameters.toString()
            ].indexOf(parameter) < 0 &&
            Array.isArray(tile[parameter as keyof common.FilePartTile])
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST_IN_TILE_PARAMETERS,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartTile
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
            tile[parameter as keyof common.FilePartTile]?.constructor ===
              Object &&
            [
              common.ParameterEnum.Data.toString(),
              // common.ParameterEnum.Axis.toString(),
              common.ParameterEnum.Options.toString(),
              common.ParameterEnum.Plate.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum.UNEXPECTED_DICTIONARY_IN_TILE_PARAMETERS,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartTile
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
              common.ParameterEnum.Select.toString(),
              common.ParameterEnum.Parameters.toString()
            ].indexOf(parameter) > -1 &&
            !Array.isArray(tile[parameter as keyof common.FilePartTile])
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_PARAMETER_MUST_BE_A_LIST,
                message: `parameter "${parameter}" must be a list`,
                lines: [
                  {
                    line: tile[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartTile
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
            common.isDefined(tile[parameter as keyof common.FilePartTile]) &&
            tile[parameter as keyof common.FilePartTile].constructor !==
              Object &&
            [
              common.ParameterEnum.Data.toString(),
              // common.ParameterEnum.Axis.toString(),
              common.ParameterEnum.Options.toString(),
              common.ParameterEnum.Plate.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_PARAMETER_MUST_BE_A_DICTIONARY,
                message: `parameter "${parameter}" must be a dictionary`,
                lines: [
                  {
                    line: tile[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FilePartTile
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
