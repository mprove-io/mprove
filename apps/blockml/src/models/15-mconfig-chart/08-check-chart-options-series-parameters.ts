import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartOptionsSeriesParameters;

export function checkChartOptionsSeriesParameters<T extends types.drcType>(
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
      if (common.isUndefined(tile.options?.series)) {
        return;
      }

      tile.options.series.forEach(seriesElement =>
        Object.keys(seriesElement)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              [
                common.ParameterEnum.DataRowId.toString(),
                common.ParameterEnum.DataField.toString(),
                common.ParameterEnum.Type.toString(),
                common.ParameterEnum.YAxisIndex.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.OPTIONS_SERIES_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" cannot be used ` +
                    'inside series element',
                  lines: [
                    {
                      line: seriesElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsSeriesElement
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
                seriesElement[
                  parameter as keyof common.FileChartOptionsSeriesElement
                ]
              )
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.OPTIONS_SERIES_UNEXPECTED_LIST,
                  message: `parameter "${parameter}" cannot be a list`,
                  lines: [
                    {
                      line: seriesElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsSeriesElement
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
              seriesElement[
                parameter as keyof common.FileChartOptionsSeriesElement
              ]?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.OPTIONS_SERIES_UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" cannot be a dictionary`,
                  lines: [
                    {
                      line: seriesElement[
                        (parameter +
                          constants.LINE_NUM) as keyof common.FileChartOptionsSeriesElement
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
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(
              y =>
                seriesElement[
                  y as keyof common.FileChartOptionsSeriesElement
                ] as number
            )
            .filter(ln => ln !== 0);

          if (
            [
              common.CallerEnum.BuildDashboardTileCharts,
              common.CallerEnum.BuildChartTileCharts
            ].indexOf(caller) > -1
          ) {
            if (common.isUndefined(seriesElement.data_field)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.OPTIONS_SERIES_MISSING_DATA_FIELD,
                  message: `Series element must have "${common.ParameterEnum.DataField}" parameter`,
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

            if (common.isDefined(seriesElement.data_field)) {
              if (
                common.isUndefined(
                  (tile as common.FilePartTile).data.y_fields
                ) ||
                (tile as common.FilePartTile).data.y_fields.indexOf(
                  seriesElement.data_field
                ) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.OPTIONS_SERIES_WRONG_DATA_FIELD,
                    message:
                      `"${common.ParameterEnum.DataField}" value must be one of ` +
                      `"${common.ParameterEnum.YFields}" elements`,
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

            if (common.isDefined(seriesElement.data_row_id)) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.OPTIONS_SERIES_WRONG_USE_OF_DATA_ROW_ID,
                  message: `"${common.ParameterEnum.DataRowId}" can only be used inside report`,
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

          if (caller === common.CallerEnum.BuildReportCharts) {
            if (common.isUndefined(seriesElement.data_row_id)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.OPTIONS_SERIES_MISSING_DATA_ROW_ID,
                  message: `Series element must have "${common.ParameterEnum.DataRowId}" parameter`,
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

            if (common.isDefined(seriesElement.data_row_id)) {
              if (
                (x as common.FileReport).rows
                  .filter(
                    row =>
                      common.toBooleanFromLowercaseString(row.show_chart) ===
                      true
                  )
                  .map(row => row.row_id)
                  .indexOf(seriesElement.data_row_id) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.OPTIONS_SERIES_WRONG_DATA_ROW_ID,
                    message:
                      `"${common.ParameterEnum.DataRowId}" value must be one of ` +
                      `row_ids with "${common.ParameterEnum.ShowChart}" enabled`,
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

            if (common.isDefined(seriesElement.data_field)) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.OPTIONS_SERIES_WRONG_USE_OF_DATA_FIELD,
                  message: `"${common.ParameterEnum.DataField}" can only be used inside dashboard or chart`,
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
            common.isDefined(seriesElement.y_axis_index) &&
            Number(seriesElement.y_axis_index) > 0 &&
            (common.isUndefined(tile.options.y_axis) ||
              Number(seriesElement.y_axis_index) >
                tile.options.y_axis.length - 1)
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_SERIES_WRONG_Y_AXIS_INDEX,
                message: `"${common.ParameterEnum.YAxisIndex}" must be index of ${common.ParameterEnum.YAxis} elements starting from 0`,
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
            common.isDefined(seriesElement.type) &&
            common.CHART_TYPE_VALUES.indexOf(seriesElement.type) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_SERIES_WRONG_TYPE,
                message: `value "${seriesElement.type}" is not valid series "${common.ParameterEnum.Type}"`,
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
