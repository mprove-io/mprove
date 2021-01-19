import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { types } from '../../barrels/types';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckChartTileParameters;

export function checkChartTileParameters<T extends types.dzType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let { caller, structId, cs } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.tile)) {
        return;
      }

      Object.keys(report.tile)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
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
              api.ChartTileWidthEnum._1,
              api.ChartTileWidthEnum._2,
              api.ChartTileWidthEnum._3,
              api.ChartTileWidthEnum._4,
              api.ChartTileWidthEnum._5,
              api.ChartTileWidthEnum._6,
              api.ChartTileWidthEnum._7,
              api.ChartTileWidthEnum._8,
              api.ChartTileWidthEnum._9,
              api.ChartTileWidthEnum._10,
              api.ChartTileWidthEnum._11,
              api.ChartTileWidthEnum._12
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
              api.ChartTileHeightEnum._300,
              api.ChartTileHeightEnum._400,
              api.ChartTileHeightEnum._500,
              api.ChartTileHeightEnum._600,
              api.ChartTileHeightEnum._700,
              api.ChartTileHeightEnum._800,
              api.ChartTileHeightEnum._900,
              api.ChartTileHeightEnum._1000,
              api.ChartTileHeightEnum._1100,
              api.ChartTileHeightEnum._1200,
              api.ChartTileHeightEnum._1300,
              api.ChartTileHeightEnum._1400,
              api.ChartTileHeightEnum._1500,
              api.ChartTileHeightEnum._1600,
              api.ChartTileHeightEnum._1700,
              api.ChartTileHeightEnum._1800,
              api.ChartTileHeightEnum._1900
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
            [api.ChartViewSizeEnum.Auto, api.ChartViewSizeEnum.Manual].indexOf(
              report.tile[parameter]
            ) < 0
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
              api.MyRegex.CAPTURE_DIGITS_START_TO_END_G()
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
