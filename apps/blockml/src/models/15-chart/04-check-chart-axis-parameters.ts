import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartAxisParameters;

export function checkChartAxisParameters<T extends types.dzType>(
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
      if (common.isUndefined(tile.axis)) {
        return;
      }

      Object.keys(tile.axis)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.XAxis.toString(),
              common.ParameterEnum.ShowXAxisLabel.toString(),
              common.ParameterEnum.XAxisLabel.toString(),
              common.ParameterEnum.YAxis.toString(),
              common.ParameterEnum.ShowYAxisLabel.toString(),
              common.ParameterEnum.YAxisLabel.toString(),
              common.ParameterEnum.ShowAxis.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_AXIS_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used  ` +
                  'inside Tile Axis',
                lines: [
                  {
                    line: tile.axis[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartAxis
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
              tile.axis[parameter as keyof common.FileChartAxis] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_AXIS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a List`,
                lines: [
                  {
                    line: tile.axis[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartAxis
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
            (tile.axis[parameter as keyof common.FileChartAxis] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_AXIS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a Dictionary`,
                lines: [
                  {
                    line: tile.axis[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartAxis
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
              common.ParameterEnum.XAxis.toString(),
              common.ParameterEnum.ShowXAxisLabel.toString(),
              common.ParameterEnum.YAxis.toString(),
              common.ParameterEnum.ShowYAxisLabel.toString(),
              common.ParameterEnum.ShowAxis.toString()
            ].indexOf(parameter) > -1 &&
            !(tile.axis[parameter as keyof common.FileChartAxis] as any)
              .toString()
              .match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.TILE_AXIS_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: tile.axis[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartAxis
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
