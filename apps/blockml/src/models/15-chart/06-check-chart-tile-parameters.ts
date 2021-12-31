import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartTileParameters;

export function checkChartTileParameters<T extends types.dzType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (common.isUndefined(report.tile)) {
        return;
      }

      Object.keys(report.tile)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.TileWidth.toString(),
              enums.ParameterEnum.TileHeight.toString(),
              enums.ParameterEnum.TileX.toString(),
              enums.ParameterEnum.TileY.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used ` +
                  'inside Report tile',
                lines: [
                  {
                    line: report.tile[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartTile
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
              report.tile[parameter as keyof interfaces.ChartTile] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: report.tile[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartTile
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
            (report.tile[parameter as keyof interfaces.ChartTile] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: report.tile[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartTile
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
              enums.ParameterEnum.TileWidth.toString(),
              enums.ParameterEnum.TileHeight.toString(),
              enums.ParameterEnum.TileX.toString(),
              enums.ParameterEnum.TileY.toString()
            ].indexOf(parameter) > -1 &&
            !(report.tile[
              parameter as keyof interfaces.ChartTile
            ] as any).match(common.MyRegex.CAPTURE_DIGITS_START_TO_END_G())
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .REPORT_TILE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${
                    report.tile[parameter as keyof interfaces.ChartTile] as any
                  }" is not valid ` + `${parameter} value`,
                lines: [
                  {
                    line: report.tile[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartTile
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
