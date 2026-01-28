import { ConfigService } from '@nestjs/config';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileChartOptionsXAxisElement } from '#common/interfaces/blockml/internal/file-chart-options-x-axis';
import { MyRegex } from '#common/models/my-regex';
import { dcType } from '#common/types/dc-type';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartOptionsXAxisParameters;

export function checkChartOptionsXAxisParameters<T extends dcType>(
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
      if (isUndefined(tile.options?.x_axis)) {
        return;
      }

      Object.keys(tile.options.x_axis)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if ([ParameterEnum.Scale.toString()].indexOf(parameter) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_X_AXIS_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  'inside x_axis element',
                lines: [
                  {
                    line: tile.options.x_axis[
                      (parameter +
                        LINE_NUM) as keyof FileChartOptionsXAxisElement
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
              tile.options.x_axis[
                parameter as keyof FileChartOptionsXAxisElement
              ]
            )
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_X_AXIS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile.options.x_axis[
                      (parameter +
                        LINE_NUM) as keyof FileChartOptionsXAxisElement
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
            tile.options.x_axis[parameter as keyof FileChartOptionsXAxisElement]
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_X_AXIS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile.options.x_axis[
                      (parameter +
                        LINE_NUM) as keyof FileChartOptionsXAxisElement
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
            [ParameterEnum.Scale.toString()].indexOf(parameter) > -1 &&
            !tile.options.x_axis[
              parameter as keyof FileChartOptionsXAxisElement
            ]
              .toString()
              .match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_X_AXIS_WRONG_PARAMETER_VALUE,
                message: `parameter "${parameter}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: tile.options.x_axis[
                      (parameter +
                        LINE_NUM) as keyof FileChartOptionsXAxisElement
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

      if (errorsOnStart === item.errors.length) {
        if (
          isDefined(tile.options.x_axis.scale) &&
          !tile.options.x_axis.scale.toString().match(MyRegex.TRUE_FALSE())
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.OPTIONS_X_AXIS_WRONG_PARAMETER_VALUE,
              message: `parameter "${ParameterEnum.Scale}" must be 'true' or 'false' if specified`,
              lines: [
                {
                  line: tile.options.x_axis.scale_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
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
