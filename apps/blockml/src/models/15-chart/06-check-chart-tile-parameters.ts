import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartTileParameters;

export function checkChartTileParameters<T extends types.dzType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (common.isUndefined(report.tile)) {
        return;
      }

      Object.keys(report.tile)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.TileWidth.toString(),
              enums.ParameterEnum.TileHeight.toString(),
              enums.ParameterEnum.TileSize.toString(),
              enums.ParameterEnum.ViewWidth.toString(),
              enums.ParameterEnum.ViewHeight.toString(),
              enums.ParameterEnum.ViewSize.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used ` +
                  'inside Report tile',
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (Array.isArray(report.tile[parameter])) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (report.tile[parameter]?.constructor === Object) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            parameter === enums.ParameterEnum.TileWidth &&
            [
              common.ChartTileWidthEnum._1,
              common.ChartTileWidthEnum._2,
              common.ChartTileWidthEnum._3,
              common.ChartTileWidthEnum._4,
              common.ChartTileWidthEnum._5,
              common.ChartTileWidthEnum._6,
              common.ChartTileWidthEnum._7,
              common.ChartTileWidthEnum._8,
              common.ChartTileWidthEnum._9,
              common.ChartTileWidthEnum._10,
              common.ChartTileWidthEnum._11,
              common.ChartTileWidthEnum._12
            ].indexOf(report.tile[parameter]) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_WRONG_TILE_WIDTH,
                message:
                  `"${report.tile[parameter]}" is not valid ` +
                  `${parameter} value`,
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            parameter === enums.ParameterEnum.TileHeight &&
            [
              common.ChartTileHeightEnum._300,
              common.ChartTileHeightEnum._400,
              common.ChartTileHeightEnum._500,
              common.ChartTileHeightEnum._600,
              common.ChartTileHeightEnum._700,
              common.ChartTileHeightEnum._800,
              common.ChartTileHeightEnum._900,
              common.ChartTileHeightEnum._1000,
              common.ChartTileHeightEnum._1100,
              common.ChartTileHeightEnum._1200,
              common.ChartTileHeightEnum._1300,
              common.ChartTileHeightEnum._1400,
              common.ChartTileHeightEnum._1500,
              common.ChartTileHeightEnum._1600,
              common.ChartTileHeightEnum._1700,
              common.ChartTileHeightEnum._1800,
              common.ChartTileHeightEnum._1900
            ].indexOf(report.tile[parameter]) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_WRONG_TILE_HEIGHT,
                message:
                  `"${report.tile[parameter]}" is not valid ` +
                  `${parameter} value`,
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            parameter === enums.ParameterEnum.ViewSize &&
            [
              common.ChartViewSizeEnum.Auto,
              common.ChartViewSizeEnum.Manual
            ].indexOf(report.tile[parameter]) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_TILE_WRONG_VIEW_SIZE,
                message:
                  `"${report.tile[parameter]}" is not valid ` +
                  `${parameter} value`,
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            [
              enums.ParameterEnum.ViewWidth.toString(),
              enums.ParameterEnum.ViewHeight.toString()
            ].indexOf(parameter) > -1 &&
            !report.tile[parameter].match(
              common.MyRegex.CAPTURE_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .REPORT_TILE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${report.tile[parameter]}" is not valid ` +
                  `${parameter} value`,
                lines: [
                  {
                    line: report.tile[parameter + constants.LINE_NUM],
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
