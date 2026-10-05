import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { drcType } from '#common/types/blockml/parts/internal/drc-type';
import type { FileChartOptions } from '#common/types/blockml/parts/internal/file-chart-options';

const columnWidthOptionParameters = [
  'first_column_width',
  'value_columns_width'
] satisfies FileParameter[];

let func: Func = 'build-mconfig-chart/check-chart-options-parameters';

export function checkChartOptionsParameters<T extends drcType>(item: {
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
      let tileWithType = tile as { type?: ChartType };

      if (isUndefined(tile.options)) {
        return;
      }

      Object.keys(tile.options)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            (
              [
                'format',
                'first_column_width',
                'value_columns_width',
                'x_axis',
                'y_axis',
                'series'
              ] satisfies FileParameter[]
            ).findIndex(candidate => candidate === parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_UNKNOWN_PARAMETER',
                message: `parameter "${parameter}" cannot be used inside options`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            (['y_axis', 'series'] satisfies FileParameter[]).findIndex(
              candidate => candidate === parameter
            ) < 0 &&
            Array.isArray(
              tile.options[parameter as keyof FileChartOptions] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_UNEXPECTED_LIST',
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            parameter !== ('x_axis' satisfies FileParameter) &&
            (tile.options[parameter as keyof FileChartOptions] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_UNEXPECTED_DICTIONARY',
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            parameter === ('format' satisfies FileParameter) &&
            tileWithType.type === 'pivot_table'
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_UNKNOWN_PARAMETER',
                message: `parameter "${parameter}" cannot be used inside options for pivot table charts`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            columnWidthOptionParameters.some(
              candidate => candidate === parameter
            ) &&
            tileWithType.type !== 'pivot_table'
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_UNKNOWN_PARAMETER',
                message: `parameter "${parameter}" can be used only inside options for pivot table charts`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            parameter === ('format' satisfies FileParameter) &&
            !(tile.options[parameter as keyof FileChartOptions] as any)
              .toString()
              .match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_WRONG_PARAMETER_VALUE',
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            columnWidthOptionParameters.some(
              candidate => candidate === parameter
            ) &&
            (!(tile.options[parameter as keyof FileChartOptions] as any)
              .toString()
              .match(MyRegex.CAPTURE_DIGITS_START_TO_END_G()) ||
              Number(tile.options[parameter as keyof FileChartOptions]) <= 0)
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_WRONG_PARAMETER_VALUE',
                message:
                  `parameter "${parameter}" value must be ` +
                  'a positive integer if specified',
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
