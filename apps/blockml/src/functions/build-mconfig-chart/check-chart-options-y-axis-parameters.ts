import { ConfigService } from '@nestjs/config';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileChartOptionsYAxisElement } from '#common/interfaces/blockml/internal/file-chart-options-y-axis';
import { MyRegex } from '#common/models/my-regex';
import { drcType } from '#common/types/drc-type';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartOptionsYAxisParameters;

export function checkChartOptionsYAxisParameters<T extends drcType>(
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
      if (isUndefined(tile.options?.y_axis)) {
        return;
      }

      if (tile.options.y_axis.length > 2) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.OPTIONS_TOO_MANY_Y_AXIS_ELEMENTS,
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
          .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if ([ParameterEnum.Scale.toString()].indexOf(parameter) < 0) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.OPTIONS_Y_AXIS_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used ` +
                    'inside y_axis element',
                  lines: [
                    {
                      line: yAxisElement[
                        (parameter +
                          LINE_NUM) as keyof FileChartOptionsYAxisElement
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
                yAxisElement[parameter as keyof FileChartOptionsYAxisElement]
              )
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.OPTIONS_Y_AXIS_UNEXPECTED_LIST,
                  message: `parameter "${parameter}" cannot be a list`,
                  lines: [
                    {
                      line: yAxisElement[
                        (parameter +
                          LINE_NUM) as keyof FileChartOptionsYAxisElement
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
              yAxisElement[parameter as keyof FileChartOptionsYAxisElement]
                ?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.OPTIONS_Y_AXIS_UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" cannot be a dictionary`,
                  lines: [
                    {
                      line: yAxisElement[
                        (parameter +
                          LINE_NUM) as keyof FileChartOptionsYAxisElement
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
            isDefined(yAxisElement.scale) &&
            !yAxisElement.scale.toString().match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_Y_AXIS_WRONG_PARAMETER_VALUE,
                message: `parameter "${ParameterEnum.Scale}" must be 'true' or 'false' if specified`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
