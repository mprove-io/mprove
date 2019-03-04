import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function checkChartOptionsParameters(item: {
  dashboards: interfaces.Dashboard[]
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      if (typeof report.options === 'undefined' || report.options === null) {
        newReports.push(report);
        return;
      }

      Object.keys(report.options)
        .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {

          if (nextReport) { return; }

          if ([
            'gradient',
            'legend',
            'tooltip_disabled',
            'round_domains',
            'show_grid_lines',
            'timeline',
            'auto_scale',
            'doughnut',
            'explode_slices',
            'labels',
            'color_scheme',
            'scheme_type',
            'page_size',
            'arc_width',
            'bar_padding',
            'group_padding',
            'inner_padding',
            'range_fill_opacity',
            'angle_span',
            'start_angle',
            'big_segments',
            'small_segments',
            'min',
            'max',
            'units',
            'band_color',
            'card_color',
            'text_color',
            'empty_color',

            'animations',
            'legend_title',
            'round_edges',
            'interpolation',
            'x_scale_max',
            'y_scale_min',
            'y_scale_max',
          ].indexOf(parameter) < 0) {

            // error e188
            ErrorsCollector.addError(new AmError({
              title: `unknown report options parameter`,
              message: `parameter "${parameter}" can not be used inside Report options`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (Array.isArray((<any>report.options)[parameter])) {
            // error e189
            ErrorsCollector.addError(new AmError({
              title: `unexpected List`,
              message: `parameter '${parameter}' can not be a List`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (!!(<any>report.options)[parameter] && (<any>report.options)[parameter].constructor === Object) {
            // error e190
            ErrorsCollector.addError(new AmError({
              title: `unexpected Hash`,
              message: `parameter '${parameter}' can not be a Hash`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if ([
            'animations',
            'round_edges',
            'gradient',
            'legend',
            'tooltip_disabled',
            'round_domains',
            'show_grid_lines',
            'timeline',
            'auto_scale',
            'doughnut',
            'explode_slices',
            'labels',
          ].indexOf(parameter) > -1 && !(<any>report.options)[parameter].toString().match(ApRegex.TRUE_FALSE())) {
            // error e191
            ErrorsCollector.addError(new AmError({
              title: `wrong report ${parameter} value`,
              message: `parameter '${parameter}' value must be "true" or "false" if specified`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (parameter === 'interpolation' &&
            [
              api.ChartInterpolationEnum.Basis,
              api.ChartInterpolationEnum.BasisClosed,
              api.ChartInterpolationEnum.Bundle,
              api.ChartInterpolationEnum.Cardinal,
              api.ChartInterpolationEnum.CardinalClosed,
              api.ChartInterpolationEnum.CatmullRomClosed,
              api.ChartInterpolationEnum.CatmullRom,
              api.ChartInterpolationEnum.Linear,
              api.ChartInterpolationEnum.LinearClosed,
              api.ChartInterpolationEnum.MonotoneX,
              api.ChartInterpolationEnum.MonotoneY,
              api.ChartInterpolationEnum.Natural,
              api.ChartInterpolationEnum.Step,
              api.ChartInterpolationEnum.StepAfter,
              api.ChartInterpolationEnum.StepBefore,
            ].indexOf(report.options[parameter]) < 0) {
            // error e267
            ErrorsCollector.addError(new AmError({
              title: `wrong report interpolation value`,
              message: `"${report.options[parameter]}" is not valid interpolation value`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (parameter === 'color_scheme' &&
            [
              api.ChartColorSchemeEnum.Air,
              api.ChartColorSchemeEnum.Aqua,
              api.ChartColorSchemeEnum.Cool,
              api.ChartColorSchemeEnum.Fire,
              api.ChartColorSchemeEnum.Flame,
              api.ChartColorSchemeEnum.Forest,
              api.ChartColorSchemeEnum.Horizon,
              api.ChartColorSchemeEnum.Natural,
              api.ChartColorSchemeEnum.Neons,
              api.ChartColorSchemeEnum.Night,
              api.ChartColorSchemeEnum.NightLights,
              api.ChartColorSchemeEnum.Ocean,
              api.ChartColorSchemeEnum.Picnic,
              api.ChartColorSchemeEnum.Solar,
              api.ChartColorSchemeEnum.Vivid,
            ].indexOf(report.options[parameter]) < 0) {
            // error e192
            ErrorsCollector.addError(new AmError({
              title: `wrong report color_scheme value`,
              message: `"${report.options[parameter]}" is not valid color_scheme value`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if (parameter === 'scheme_type' &&
            [
              api.ChartSchemeTypeEnum.Linear,
              api.ChartSchemeTypeEnum.Ordinal,
            ].indexOf(report.options[parameter]) < 0) {
            // error e193
            ErrorsCollector.addError(new AmError({
              title: `wrong report scheme_type value`,
              message: `"${report.options[parameter]}" is not valid scheme_type value`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if ([
            'page_size',
            'bar_padding',
            'group_padding',
            'inner_padding',
            'angle_span',
            'big_segments',
            'small_segments',
            'min',
            'max',
          ].indexOf(parameter) > -1 &&
            !(<any>report.options)[parameter].match(ApRegex.CAPTURE_DIGITS_START_TO_END_G())) {
            // error e194
            ErrorsCollector.addError(new AmError({
              title: `wrong report ${parameter} value`,
              message: `"${(<any>report.options)[parameter]}" is not an integer`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if ([
            'arc_width',
            'range_fill_opacity',
          ].indexOf(parameter) > -1 &&
            !(<any>report.options)[parameter].match(ApRegex.CAPTURE_FLOAT_START_TO_END_G())) {
            // error e195
            ErrorsCollector.addError(new AmError({
              title: `wrong report ${parameter} value`,
              message: `"${(<any>report.options)[parameter]}" is not a number`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if ([
            'start_angle',
            'x_scale_max',
            'y_scale_min',
            'y_scale_max',
          ].indexOf(parameter) > -1 &&
            !(<any>report.options)[parameter].match(ApRegex.CAPTURE_MINUS_DIGITS_START_TO_END_G())) {
            // error e197
            ErrorsCollector.addError(new AmError({
              title: `wrong report ${parameter} value`,
              message: `"${(<any>report.options)[parameter]}" is not valid`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          if ([
            'band_color',
            'card_color',
            'text_color',
            'empty_color',
          ].indexOf(parameter) > -1 &&
            !(<any>report.options)[parameter].match(ApRegex.CAPTURE_RGB_G()) &&
            !(<any>report.options)[parameter].match(ApRegex.CAPTURE_RGBA_G())) {
            // error e198
            ErrorsCollector.addError(new AmError({
              title: `wrong report ${parameter} value`,
              message: `"${(<any>report.options)[parameter]}" is not valid`,
              lines: [{
                line: (<any>report.options)[parameter + '_line_num'],
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