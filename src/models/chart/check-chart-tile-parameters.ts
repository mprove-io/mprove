import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function checkChartTileParameters(item: { dashboards: interfaces.Dashboard[] }) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      if (typeof report.tile === 'undefined' || report.tile === null) {
        newReports.push(report);
        return;
      }

      Object.keys(report.tile)
        .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {

          if (nextReport) { return; }

          if ([
            'tile_width',
            'tile_height',
            'view_size',
            'view_width',
            'view_height',
          ].indexOf(parameter) < 0) {

            // error e199
            ErrorsCollector.addError(new AmError({
              title: `unknown report tile parameter`,
              message: `parameter "${parameter}" can not be used inside Report tile`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (Array.isArray((<any>report.tile)[parameter])) {
            // error e200
            ErrorsCollector.addError(new AmError({
              title: `unexpected List`,
              message: `parameter '${parameter}' can not be a List`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (!!(<any>report.tile)[parameter] && (<any>report.tile)[parameter].constructor === Object) {
            // error e201
            ErrorsCollector.addError(new AmError({
              title: `unexpected Hash`,
              message: `parameter '${parameter}' can not be a Hash`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (parameter === 'tile_width' &&
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
              api.ChartTileWidthEnum._12,
            ].indexOf(report.tile[parameter]) < 0) {
            // error e202
            ErrorsCollector.addError(new AmError({
              title: `wrong report tile_width value`,
              message: `"${report.tile[parameter]}" is not valid tile_width value`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (parameter === 'tile_height' &&
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
              api.ChartTileHeightEnum._1900,
            ].indexOf(report.tile[parameter]) < 0) {
            // error e203
            ErrorsCollector.addError(new AmError({
              title: `wrong report tile_height value`,
              message: `"${report.tile[parameter]}" is not valid tile_height value`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (parameter === 'view_size' &&
            [
              api.ChartViewSizeEnum.Auto,
              api.ChartViewSizeEnum.Manual,
            ].indexOf(report.tile[parameter]) < 0) {
            // error e204
            ErrorsCollector.addError(new AmError({
              title: `wrong report view_size value`,
              message: `"${report.tile[parameter]}" is not valid view_size value`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if ([
            'view_width',
            'view_height',
          ].indexOf(parameter) > -1 &&
            !(<any>report.tile)[parameter].match(ApRegex.CAPTURE_DIGITS_START_TO_END_G())) {
            // error e205
            ErrorsCollector.addError(new AmError({
              title: `wrong report ${parameter} value`,
              message: `"${(<any>report.tile)[parameter]}" is not an integer`,
              lines: [{
                line: (<any>report.tile)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

        });

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}