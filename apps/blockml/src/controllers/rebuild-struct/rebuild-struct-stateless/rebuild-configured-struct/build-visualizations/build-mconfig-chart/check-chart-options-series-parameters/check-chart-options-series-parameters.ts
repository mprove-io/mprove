import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import { chartTypeValues } from '#common/types/blockml/parts/chart/chart-type';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { drcType } from '#common/types/blockml/parts/internal/drc-type';
import type { FileChartOptionsSeriesElement } from '#common/types/blockml/parts/internal/file-chart-options-series';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';

let func: Func = 'build-mconfig-chart/check-chart-options-series-parameters';

export function checkChartOptionsSeriesParameters<T extends drcType>(item: {
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
      if (isUndefined(tile.options?.series)) {
        return;
      }

      tile.options.series.forEach(seriesElement =>
        Object.keys(seriesElement)
          .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              (
                [
                  'data_row_id',
                  'data_field',
                  'type',
                  'y_axis_index'
                ] satisfies FileParameter[]
              ).findIndex(candidate => candidate === parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_UNKNOWN_PARAMETER',
                  message:
                    `parameter "${parameter}" cannot be used ` +
                    'inside series element',
                  lines: [
                    {
                      line: seriesElement[
                        (parameter +
                          LINE_NUM) as keyof FileChartOptionsSeriesElement
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
                seriesElement[parameter as keyof FileChartOptionsSeriesElement]
              )
            ) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_UNEXPECTED_LIST',
                  message: `parameter "${parameter}" cannot be a list`,
                  lines: [
                    {
                      line: seriesElement[
                        (parameter +
                          LINE_NUM) as keyof FileChartOptionsSeriesElement
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
              seriesElement[parameter as keyof FileChartOptionsSeriesElement]
                ?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_UNEXPECTED_DICTIONARY',
                  message: `parameter "${parameter}" cannot be a dictionary`,
                  lines: [
                    {
                      line: seriesElement[
                        (parameter +
                          LINE_NUM) as keyof FileChartOptionsSeriesElement
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
        tile.options.series.forEach(seriesElement => {
          let pKeysLineNums: number[] = Object.keys(seriesElement)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(
              y =>
                seriesElement[
                  y as keyof FileChartOptionsSeriesElement
                ] as number
            )
            .filter(ln => ln !== 0);

          if (
            (
              [
                'BuildDashboardTileCharts',
                'BuildChartTileCharts'
              ] satisfies Caller[]
            ).some(candidate => candidate === caller)
          ) {
            if (isUndefined(seriesElement.data_field)) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_MISSING_DATA_FIELD',
                  message: `Series element must have "${'data_field' satisfies FileParameter}" parameter`,
                  lines: [
                    {
                      line: Math.min(...pKeysLineNums),
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (isDefined(seriesElement.data_field)) {
              if (
                isUndefined((tile as FilePartTile).data.y_fields) ||
                (tile as FilePartTile).data.y_fields.indexOf(
                  seriesElement.data_field
                ) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: 'OPTIONS_SERIES_WRONG_DATA_FIELD',
                    message:
                      `"${'data_field' satisfies FileParameter}" value must be one of ` +
                      `"${'y_fields' satisfies FileParameter}" elements`,
                    lines: [
                      {
                        line: seriesElement.data_field_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }
            }

            if (isDefined(seriesElement.data_row_id)) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_WRONG_USE_OF_DATA_ROW_ID',
                  message: `"${'data_row_id' satisfies FileParameter}" can only be used inside report`,
                  lines: [
                    {
                      line: seriesElement.data_row_id_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          }

          if (caller === 'BuildReportCharts') {
            if (isUndefined(seriesElement.data_row_id)) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_MISSING_DATA_ROW_ID',
                  message: `Series element must have "${'data_row_id' satisfies FileParameter}" parameter`,
                  lines: [
                    {
                      line: Math.min(...pKeysLineNums),
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (isDefined(seriesElement.data_row_id)) {
              if (
                (x as FileReport).rows
                  .filter(
                    row => toBooleanFromLowercaseString(row.show_chart) === true
                  )
                  .map(row => row.row_id)
                  .indexOf(seriesElement.data_row_id) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: 'OPTIONS_SERIES_WRONG_DATA_ROW_ID',
                    message:
                      `"${'data_row_id' satisfies FileParameter}" value must be one of ` +
                      `row_ids with "${'show_chart' satisfies FileParameter}" enabled`,
                    lines: [
                      {
                        line: seriesElement.data_row_id_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }
            }

            if (isDefined(seriesElement.data_field)) {
              item.errors.push(
                new BmError({
                  title: 'OPTIONS_SERIES_WRONG_USE_OF_DATA_FIELD',
                  message: `"${'data_field' satisfies FileParameter}" can only be used inside dashboard or chart`,
                  lines: [
                    {
                      line: seriesElement.data_field_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          }

          if (
            isDefined(seriesElement.y_axis_index) &&
            Number(seriesElement.y_axis_index) > 0 &&
            (isUndefined(tile.options.y_axis) ||
              Number(seriesElement.y_axis_index) >
                tile.options.y_axis.length - 1)
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_SERIES_WRONG_Y_AXIS_INDEX',
                message: `"${'y_axis_index' satisfies FileParameter}" must be index of ${'y_axis' satisfies FileParameter} elements starting from 0`,
                lines: [
                  {
                    line: seriesElement.y_axis_index_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            isDefined(seriesElement.type) &&
            chartTypeValues.indexOf(seriesElement.type) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'OPTIONS_SERIES_WRONG_TYPE',
                message: `value "${seriesElement.type}" is not valid series "${'type' satisfies FileParameter}"`,
                lines: [
                  {
                    line: seriesElement.type_line_num,
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
