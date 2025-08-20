import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { CHART_TYPE_VALUES } from '~common/constants/top';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FileChartOptionsSeriesElement } from '~common/interfaces/blockml/internal/file-chart-options-series';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { MyRegex } from '~common/models/my-regex';
import { drcType } from '~common/types/drc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartOptionsSeriesParameters;

export function checkChartOptionsSeriesParameters<T extends drcType>(
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
      if (isUndefined(tile.options?.series)) {
        return;
      }

      tile.options.series.forEach(seriesElement =>
        Object.keys(seriesElement)
          .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              [
                ParameterEnum.DataRowId.toString(),
                ParameterEnum.DataField.toString(),
                ParameterEnum.Type.toString(),
                ParameterEnum.YAxisIndex.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.OPTIONS_SERIES_UNKNOWN_PARAMETER,
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
                  title: ErTitleEnum.OPTIONS_SERIES_UNEXPECTED_LIST,
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
                  title: ErTitleEnum.OPTIONS_SERIES_UNEXPECTED_DICTIONARY,
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
            [
              CallerEnum.BuildDashboardTileCharts,
              CallerEnum.BuildChartTileCharts
            ].indexOf(caller) > -1
          ) {
            if (isUndefined(seriesElement.data_field)) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.OPTIONS_SERIES_MISSING_DATA_FIELD,
                  message: `Series element must have "${ParameterEnum.DataField}" parameter`,
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
                    title: ErTitleEnum.OPTIONS_SERIES_WRONG_DATA_FIELD,
                    message:
                      `"${ParameterEnum.DataField}" value must be one of ` +
                      `"${ParameterEnum.YFields}" elements`,
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
                  title: ErTitleEnum.OPTIONS_SERIES_WRONG_USE_OF_DATA_ROW_ID,
                  message: `"${ParameterEnum.DataRowId}" can only be used inside report`,
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

          if (caller === CallerEnum.BuildReportCharts) {
            if (isUndefined(seriesElement.data_row_id)) {
              item.errors.push(
                new BmError({
                  title: ErTitleEnum.OPTIONS_SERIES_MISSING_DATA_ROW_ID,
                  message: `Series element must have "${ParameterEnum.DataRowId}" parameter`,
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
                    title: ErTitleEnum.OPTIONS_SERIES_WRONG_DATA_ROW_ID,
                    message:
                      `"${ParameterEnum.DataRowId}" value must be one of ` +
                      `row_ids with "${ParameterEnum.ShowChart}" enabled`,
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
                  title: ErTitleEnum.OPTIONS_SERIES_WRONG_USE_OF_DATA_FIELD,
                  message: `"${ParameterEnum.DataField}" can only be used inside dashboard or chart`,
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
                title: ErTitleEnum.OPTIONS_SERIES_WRONG_Y_AXIS_INDEX,
                message: `"${ParameterEnum.YAxisIndex}" must be index of ${ParameterEnum.YAxis} elements starting from 0`,
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
            CHART_TYPE_VALUES.indexOf(seriesElement.type) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_SERIES_WRONG_TYPE,
                message: `value "${seriesElement.type}" is not valid series "${ParameterEnum.Type}"`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
