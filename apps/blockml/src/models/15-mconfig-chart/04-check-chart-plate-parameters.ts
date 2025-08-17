import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartPlateParameters;

export function checkChartPlateParameters<T extends types.dcType>(
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
      if (common.isUndefined(tile.plate)) {
        return;
      }

      Object.keys(tile.plate)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.PlateWidth.toString(),
              common.ParameterEnum.PlateHeight.toString(),
              common.ParameterEnum.PlateX.toString(),
              common.ParameterEnum.PlateY.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_PLATE_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  'inside Tile plate',
                lines: [
                  {
                    line: tile.plate[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartPlate
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
              tile.plate[parameter as keyof common.FileChartPlate] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_PLATE_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile.plate[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartPlate
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
            (tile.plate[parameter as keyof common.FileChartPlate] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_PLATE_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile.plate[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartPlate
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
              common.ParameterEnum.PlateWidth.toString(),
              common.ParameterEnum.PlateHeight.toString(),
              common.ParameterEnum.PlateX.toString(),
              common.ParameterEnum.PlateY.toString()
            ].indexOf(parameter) > -1 &&
            !(
              tile.plate[parameter as keyof common.FileChartPlate] as any
            ).match(common.MyRegex.CAPTURE_DIGITS_START_TO_END_G())
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .TILE_PLATE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${
                    tile.plate[parameter as keyof common.FileChartPlate] as any
                  }" is not valid ` + `${parameter} value`,
                lines: [
                  {
                    line: tile.plate[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartPlate
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
