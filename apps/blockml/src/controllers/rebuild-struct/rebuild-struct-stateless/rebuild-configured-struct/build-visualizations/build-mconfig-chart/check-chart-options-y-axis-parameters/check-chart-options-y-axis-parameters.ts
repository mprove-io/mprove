import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { drcType } from '#common/types/blockml/parts/internal/drc-type';
import type { FileChartOptionsYAxisElement } from '#common/types/blockml/parts/internal/file-chart-options-y-axis';

let func: Func = 'build-mconfig-chart/check-chart-options-y-axis-parameters';

export function checkChartOptionsYAxisParameters<T extends drcType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

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
            title: 'OPTIONS_TOO_MANY_Y_AXIS_ELEMENTS',
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
            if (['scale'.toString()].indexOf(parameter) < 0) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_Y_AXIS_UNKNOWN_PARAMETER',
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
                  title: 'OPTIONS_Y_AXIS_UNEXPECTED_LIST',
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
                  title: 'OPTIONS_Y_AXIS_UNEXPECTED_DICTIONARY',
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
                title: 'OPTIONS_Y_AXIS_WRONG_PARAMETER_VALUE',
                message: `parameter "scale" must be 'true' or 'false' if specified`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
