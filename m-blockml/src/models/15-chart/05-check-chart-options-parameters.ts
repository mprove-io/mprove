import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { types } from '../../barrels/types';

let func = enums.FuncEnum.CheckChartOptionsParameters;

export function checkChartOptionsParameters<T extends types.dzType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (helper.isUndefined(report.options)) {
        return;
      }

      Object.keys(report.options)
        .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.Gradient.toString(),
              enums.ParameterEnum.Legend.toString(),
              enums.ParameterEnum.TooltipDisabled.toString(),
              enums.ParameterEnum.RoundDomains.toString(),
              enums.ParameterEnum.ShowGridLines.toString(),
              enums.ParameterEnum.Timeline.toString(),
              enums.ParameterEnum.AutoScale.toString(),
              enums.ParameterEnum.Doughnut.toString(),
              enums.ParameterEnum.ExplodeSlices.toString(),
              enums.ParameterEnum.Labels.toString(),
              enums.ParameterEnum.ColorScheme.toString(),
              enums.ParameterEnum.SchemeType.toString(),
              enums.ParameterEnum.PageSize.toString(),
              enums.ParameterEnum.ArcWidth.toString(),
              enums.ParameterEnum.BarPadding.toString(),
              enums.ParameterEnum.GroupPadding.toString(),
              enums.ParameterEnum.InnerPadding.toString(),
              enums.ParameterEnum.RangeFillOpacity.toString(),
              enums.ParameterEnum.AngleSpan.toString(),
              enums.ParameterEnum.StartAngle.toString(),
              enums.ParameterEnum.BigSegments.toString(),
              enums.ParameterEnum.SmallSegments.toString(),
              enums.ParameterEnum.Min.toString(),
              enums.ParameterEnum.Max.toString(),
              enums.ParameterEnum.Units.toString(),
              enums.ParameterEnum.BandColor.toString(),
              enums.ParameterEnum.CardColor.toString(),
              enums.ParameterEnum.TextColor.toString(),
              enums.ParameterEnum.EmptyColor.toString(),
              enums.ParameterEnum.Animations.toString(),
              enums.ParameterEnum.LegendTitle.toString(),
              enums.ParameterEnum.RoundEdges.toString(),
              enums.ParameterEnum.Interpolation.toString(),
              enums.ParameterEnum.XScaleMax.toString(),
              enums.ParameterEnum.YScaleMin.toString(),
              enums.ParameterEnum.YScaleMax.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_UNKNOWN_PARAMETER,
                message:
                  `parameter "${parameter}" can not be used ` +
                  'inside Report options',
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (Array.isArray(report.options[parameter])) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (report.options[parameter]?.constructor === Object) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
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
              enums.ParameterEnum.Animations.toString(),
              enums.ParameterEnum.RoundEdges.toString(),
              enums.ParameterEnum.Gradient.toString(),
              enums.ParameterEnum.Legend.toString(),
              enums.ParameterEnum.TooltipDisabled.toString(),
              enums.ParameterEnum.RoundDomains.toString(),
              enums.ParameterEnum.ShowGridLines.toString(),
              enums.ParameterEnum.Timeline.toString(),
              enums.ParameterEnum.AutoScale.toString(),
              enums.ParameterEnum.Doughnut.toString(),
              enums.ParameterEnum.ExplodeSlices.toString(),
              enums.ParameterEnum.Labels.toString()
            ].indexOf(parameter) > -1 &&
            !report.options[parameter]
              .toString()
              .match(api.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            parameter === enums.ParameterEnum.Interpolation &&
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
              api.ChartInterpolationEnum.StepBefore
            ].indexOf(report.options[parameter]) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_INTERPOLATION,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            parameter === enums.ParameterEnum.ColorScheme &&
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
              api.ChartColorSchemeEnum.Vivid
            ].indexOf(report.options[parameter]) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_COLOR_SCHEME,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            parameter === enums.ParameterEnum.SchemeType &&
            [
              api.ChartSchemeTypeEnum.Linear,
              api.ChartSchemeTypeEnum.Ordinal
            ].indexOf(report.options[parameter]) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_SCHEME_TYPE,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
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
              enums.ParameterEnum.PageSize.toString(),
              enums.ParameterEnum.BarPadding.toString(),
              enums.ParameterEnum.GroupPadding.toString(),
              enums.ParameterEnum.InnerPadding.toString(),
              enums.ParameterEnum.AngleSpan.toString(),
              enums.ParameterEnum.BigSegments.toString(),
              enums.ParameterEnum.SmallSegments.toString(),
              enums.ParameterEnum.Min.toString(),
              enums.ParameterEnum.Max.toString()
            ].indexOf(parameter) > -1 &&
            !report.options[parameter].match(
              api.MyRegex.CAPTURE_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .REPORT_OPTIONS_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
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
              enums.ParameterEnum.ArcWidth.toString(),
              enums.ParameterEnum.RangeFillOpacity.toString()
            ].indexOf(parameter) > -1 &&
            !report.options[parameter].match(
              api.MyRegex.CAPTURE_FLOAT_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_OPTIONS_PARAMETER_MUST_BE_A_NUMBER,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
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
              enums.ParameterEnum.StartAngle.toString(),
              enums.ParameterEnum.XScaleMax.toString(),
              enums.ParameterEnum.YScaleMin.toString(),
              enums.ParameterEnum.YScaleMax.toString()
            ].indexOf(parameter) > -1 &&
            !report.options[parameter].match(
              api.MyRegex.CAPTURE_MINUS_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_OPTIONS_PARAMETER_MUST_BE_AN_INTEGER,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
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
              enums.ParameterEnum.BandColor.toString(),
              enums.ParameterEnum.CardColor.toString(),
              enums.ParameterEnum.TextColor.toString(),
              enums.ParameterEnum.EmptyColor.toString()
            ].indexOf(parameter) > -1 &&
            !report.options[parameter].match(api.MyRegex.CAPTURE_RGB_G()) &&
            !report.options[parameter].match(api.MyRegex.CAPTURE_RGBA_G())
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_COLOR,
                message:
                  `"${report.options[parameter]}" is not valid ` +
                  `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[parameter + constants.LINE_NUM],
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

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
