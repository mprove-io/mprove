import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartOptionsSeriesParameters;

export function checkChartOptionsSeriesParameters<T extends types.dzType>(
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
                  title:
                    common.ErTitleEnum.TILE_OPTIONS_SERIES_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used ` +
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
                  title: common.ErTitleEnum.TILE_OPTIONS_SERIES_UNEXPECTED_LIST,
                  message: `parameter "${parameter}" can not be a list`,
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
                    common.ErTitleEnum
                      .TILE_OPTIONS_SERIES_UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" can not be a dictionary`,
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
