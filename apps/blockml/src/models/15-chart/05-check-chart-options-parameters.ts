import { ConfigService } from '@nestjs/config';
import { formatSpecifier } from 'd3-format';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckChartOptionsParameters;

export function checkChartOptionsParameters<T extends types.dzType>(
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
      if (common.isUndefined(report.options)) {
        return;
      }

      Object.keys(report.options)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              enums.ParameterEnum.ShowDataLabel.toString(),
              enums.ParameterEnum.Format.toString(),
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
              enums.ParameterEnum.YScaleMax.toString(),
              enums.ParameterEnum.FormatNumberDataLabel.toString(),
              enums.ParameterEnum.FormatNumberValue.toString(),
              enums.ParameterEnum.FormatNumberAxisTick.toString(),
              enums.ParameterEnum.FormatNumberYAxisTick.toString(),
              enums.ParameterEnum.FormatNumberXAxisTick.toString()
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
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
              report.options[parameter as keyof interfaces.ChartOptions] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" can not be a list`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            (report.options[parameter as keyof interfaces.ChartOptions] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" can not be a dictionary`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            [
              enums.ParameterEnum.Animations.toString(),
              enums.ParameterEnum.RoundEdges.toString(),
              enums.ParameterEnum.ShowDataLabel.toString(),
              enums.ParameterEnum.Format.toString(),
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
            !(report.options[parameter as keyof interfaces.ChartOptions] as any)
              .toString()
              .match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            parameter === enums.ParameterEnum.Interpolation &&
            [
              common.ChartInterpolationEnum.Basis,
              common.ChartInterpolationEnum.BasisClosed,
              common.ChartInterpolationEnum.Bundle,
              common.ChartInterpolationEnum.Cardinal,
              common.ChartInterpolationEnum.CardinalClosed,
              common.ChartInterpolationEnum.CatmullRomClosed,
              common.ChartInterpolationEnum.CatmullRom,
              common.ChartInterpolationEnum.Linear,
              common.ChartInterpolationEnum.LinearClosed,
              common.ChartInterpolationEnum.MonotoneX,
              common.ChartInterpolationEnum.MonotoneY,
              common.ChartInterpolationEnum.Natural,
              common.ChartInterpolationEnum.Step,
              common.ChartInterpolationEnum.StepAfter,
              common.ChartInterpolationEnum.StepBefore
            ].indexOf(
              report.options[parameter as keyof interfaces.ChartOptions] as any
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_INTERPOLATION,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            parameter === enums.ParameterEnum.ColorScheme &&
            [
              common.ChartColorSchemeEnum.Air,
              common.ChartColorSchemeEnum.Aqua,
              common.ChartColorSchemeEnum.Cool,
              common.ChartColorSchemeEnum.Fire,
              common.ChartColorSchemeEnum.Flame,
              common.ChartColorSchemeEnum.Forest,
              common.ChartColorSchemeEnum.Horizon,
              common.ChartColorSchemeEnum.Natural,
              common.ChartColorSchemeEnum.Neons,
              common.ChartColorSchemeEnum.Night,
              common.ChartColorSchemeEnum.NightLights,
              common.ChartColorSchemeEnum.Ocean,
              common.ChartColorSchemeEnum.Picnic,
              common.ChartColorSchemeEnum.Solar,
              common.ChartColorSchemeEnum.Vivid
            ].indexOf(
              report.options[parameter as keyof interfaces.ChartOptions] as any
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_COLOR_SCHEME,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            parameter === enums.ParameterEnum.SchemeType &&
            [
              common.ChartSchemeTypeEnum.Linear,
              common.ChartSchemeTypeEnum.Ordinal
            ].indexOf(
              report.options[parameter as keyof interfaces.ChartOptions] as any
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_SCHEME_TYPE,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            !(report.options[
              parameter as keyof interfaces.ChartOptions
            ] as any).match(common.MyRegex.CAPTURE_DIGITS_START_TO_END_G())
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .REPORT_OPTIONS_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            [
              enums.ParameterEnum.ArcWidth.toString(),
              enums.ParameterEnum.RangeFillOpacity.toString()
            ].indexOf(parameter) > -1 &&
            !(report.options[
              parameter as keyof interfaces.ChartOptions
            ] as any).match(common.MyRegex.CAPTURE_FLOAT_START_TO_END_G())
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_OPTIONS_PARAMETER_MUST_BE_A_NUMBER,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            [
              enums.ParameterEnum.StartAngle.toString(),
              enums.ParameterEnum.XScaleMax.toString(),
              enums.ParameterEnum.YScaleMin.toString(),
              enums.ParameterEnum.YScaleMax.toString()
            ].indexOf(parameter) > -1 &&
            !(report.options[
              parameter as keyof interfaces.ChartOptions
            ] as any).match(
              common.MyRegex.CAPTURE_MINUS_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum.REPORT_OPTIONS_PARAMETER_MUST_BE_AN_INTEGER,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            [
              enums.ParameterEnum.BandColor.toString(),
              enums.ParameterEnum.CardColor.toString(),
              enums.ParameterEnum.TextColor.toString(),
              enums.ParameterEnum.EmptyColor.toString()
            ].indexOf(parameter) > -1 &&
            !(report.options[
              parameter as keyof interfaces.ChartOptions
            ] as any).match(common.MyRegex.CAPTURE_RGB_SPLIT_G()) &&
            !(report.options[
              parameter as keyof interfaces.ChartOptions
            ] as any).match(common.MyRegex.CAPTURE_RGBA_SPLIT_G())
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_OPTIONS_WRONG_COLOR,
                message:
                  `"${
                    report.options[
                      parameter as keyof interfaces.ChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: report.options[
                      (parameter +
                        constants.LINE_NUM) as keyof interfaces.ChartOptions
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
            [
              enums.ParameterEnum.FormatNumberDataLabel.toString(),
              enums.ParameterEnum.FormatNumberValue.toString(),
              enums.ParameterEnum.FormatNumberAxisTick.toString(),
              enums.ParameterEnum.FormatNumberYAxisTick.toString(),
              enums.ParameterEnum.FormatNumberXAxisTick.toString()
            ].indexOf(parameter) > -1
          ) {
            let value = report.options[
              parameter as keyof interfaces.ChartOptions
            ] as any;
            try {
              formatSpecifier(value);
            } catch (e) {
              item.errors.push(
                new BmError({
                  title: enums.ErTitleEnum.WRONG_FORMAT_NUMBER,
                  message: ` ${parameter} value "${value}" is not valid`,
                  lines: [
                    {
                      line: report.options[
                        (parameter +
                          constants.LINE_NUM) as keyof interfaces.ChartOptions
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
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
