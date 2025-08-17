import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartOptionsYAxisParameters;

export function checkChartOptionsYAxisParameters<T extends types.drcType>(
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
      if (common.isUndefined(tile.options?.y_axis)) {
        return;
      }

      if (tile.options.y_axis.length > 2) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.OPTIONS_TOO_MANY_Y_AXIS_ELEMENTS,
            message: `No more than 2 y_axis elements can be specified`,
            lines: [
              {
                line: tile.options.y_axis_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      tile.options.y_axis.forEach(yAxisElement =>
        Object.keys(yAxisElement)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              [common.ParameterEnum.Scale.toString()].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.OPTIONS_Y_AXIS_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used ` +
                    'inside y_axis element',
                  lines: [
                    {
                      line: yAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsYAxisElement
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
                yAxisElement[
                  parameter as keyof common.FileChartOptionsYAxisElement
                ]
              )
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.OPTIONS_Y_AXIS_UNEXPECTED_LIST,
                  message: `parameter "${parameter}" cannot be a list`,
                  lines: [
                    {
                      line: yAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsYAxisElement
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
              yAxisElement[
                parameter as keyof common.FileChartOptionsYAxisElement
              ]?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.OPTIONS_Y_AXIS_UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" cannot be a dictionary`,
                  lines: [
                    {
                      line: yAxisElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsYAxisElement
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

      if (errorsOnStart === item.errors.length) {
        tile.options.y_axis.forEach(yAxisElement => {
          if (
            common.isDefined(yAxisElement.scale) &&
            !yAxisElement.scale.toString().match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_Y_AXIS_WRONG_PARAMETER_VALUE,
                message: `parameter "${common.ParameterEnum.Scale}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: yAxisElement.scale_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
      }
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
