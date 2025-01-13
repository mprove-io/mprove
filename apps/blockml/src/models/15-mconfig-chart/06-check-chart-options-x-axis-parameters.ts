import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartOptionsXAxisParameters;

export function checkChartOptionsXAxisParameters<T extends types.dzType>(
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
      if (common.isUndefined(tile.options?.x_axis)) {
        return;
      }

      tile.options.x_axis.forEach(xAxisElement =>
        Object.keys(xAxisElement)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if ([common.ParameterEnum.Show.toString()].indexOf(parameter) < 0) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.TILE_OPTIONS_X_AXIS_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used ` +
                    'inside x_axis element',
                  lines: [
                    {
                      line: xAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsXAxisElement
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
                xAxisElement[
                  parameter as keyof common.FileChartOptionsXAxisElement
                ]
              )
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TILE_OPTIONS_X_AXIS_UNEXPECTED_LIST,
                  message: `parameter "${parameter}" can not be a list`,
                  lines: [
                    {
                      line: xAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsXAxisElement
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
              xAxisElement[
                parameter as keyof common.FileChartOptionsXAxisElement
              ]?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum
                      .TILE_OPTIONS_X_AXIS_UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" can not be a dictionary`,
                  lines: [
                    {
                      line: xAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsXAxisElement
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
              [common.ParameterEnum.Show.toString()].indexOf(parameter) > -1 &&
              !xAxisElement[
                parameter as keyof common.FileChartOptionsXAxisElement
              ]
                .toString()
                .match(common.MyRegex.TRUE_FALSE())
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TILE_OPTIONS_X_AXIS_WRONG_BOOLEAN,
                  message: `parameter "${parameter}" must be 'true' or 'false' if specified`,
                  lines: [
                    {
                      line: xAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsXAxisElement
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          })
      );
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
