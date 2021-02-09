import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
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
    entities: Array<T>;
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
              apiToBlockml.ChartTileWidthEnum._1,
              apiToBlockml.ChartTileWidthEnum._2,
              apiToBlockml.ChartTileWidthEnum._3,
              apiToBlockml.ChartTileWidthEnum._4,
              apiToBlockml.ChartTileWidthEnum._5,
              apiToBlockml.ChartTileWidthEnum._6,
              apiToBlockml.ChartTileWidthEnum._7,
              apiToBlockml.ChartTileWidthEnum._8,
              apiToBlockml.ChartTileWidthEnum._9,
              apiToBlockml.ChartTileWidthEnum._10,
              apiToBlockml.ChartTileWidthEnum._11,
              apiToBlockml.ChartTileWidthEnum._12
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
              apiToBlockml.ChartTileHeightEnum._300,
              apiToBlockml.ChartTileHeightEnum._400,
              apiToBlockml.ChartTileHeightEnum._500,
              apiToBlockml.ChartTileHeightEnum._600,
              apiToBlockml.ChartTileHeightEnum._700,
              apiToBlockml.ChartTileHeightEnum._800,
              apiToBlockml.ChartTileHeightEnum._900,
              apiToBlockml.ChartTileHeightEnum._1000,
              apiToBlockml.ChartTileHeightEnum._1100,
              apiToBlockml.ChartTileHeightEnum._1200,
              apiToBlockml.ChartTileHeightEnum._1300,
              apiToBlockml.ChartTileHeightEnum._1400,
              apiToBlockml.ChartTileHeightEnum._1500,
              apiToBlockml.ChartTileHeightEnum._1600,
              apiToBlockml.ChartTileHeightEnum._1700,
              apiToBlockml.ChartTileHeightEnum._1800,
              apiToBlockml.ChartTileHeightEnum._1900
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
              apiToBlockml.ChartViewSizeEnum.Auto,
              apiToBlockml.ChartViewSizeEnum.Manual
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
