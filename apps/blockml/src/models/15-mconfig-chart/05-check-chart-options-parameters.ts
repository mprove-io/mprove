import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckChartOptionsParameters;

export function checkChartOptionsParameters<T extends types.drcType>(
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
      if (common.isUndefined(tile.options)) {
        return;
      }

      Object.keys(tile.options)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.Format.toString(),
              common.ParameterEnum.PageSize.toString(),
              common.ParameterEnum.XAxis.toString(),
              common.ParameterEnum.YAxis.toString(),
              common.ParameterEnum.Series.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_UNKNOWN_PARAMETER,
                message: `parameter "${parameter}" cannot be used inside options`,
                lines: [
                  {
                    line: tile.options[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartOptions
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
              common.ParameterEnum.YAxis.toString(),
              common.ParameterEnum.Series.toString()
            ].indexOf(parameter) < 0 &&
            Array.isArray(
              tile.options[parameter as keyof common.FileChartOptions] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile.options[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartOptions
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
            [common.ParameterEnum.XAxis.toString()].indexOf(parameter) < 0 &&
            (tile.options[parameter as keyof common.FileChartOptions] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile.options[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartOptions
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
            [common.ParameterEnum.Format.toString()].indexOf(parameter) > -1 &&
            !(tile.options[parameter as keyof common.FileChartOptions] as any)
              .toString()
              .match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.OPTIONS_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: tile.options[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartOptions
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
            [common.ParameterEnum.PageSize.toString()].indexOf(parameter) >
              -1 &&
            !(
              tile.options[parameter as keyof common.FileChartOptions] as any
            ).match(common.MyRegex.CAPTURE_DIGITS_START_TO_END_G())
          ) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .OPTIONS_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${
                    tile.options[
                      parameter as keyof common.FileChartOptions
                    ] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: tile.options[
                      (parameter +
                        constants.LINE_NUM) as keyof common.FileChartOptions
                    ] as number,
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

// if (
//   [
//     // common.ParameterEnum.ArcWidth.toString(),
//     // common.ParameterEnum.RangeFillOpacity.toString()
//   ].indexOf(parameter) > -1 &&
//   !(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ).match(common.MyRegex.CAPTURE_FLOAT_START_TO_END_G())
// ) {
//   item.errors.push(
//     new BmError({
//       title:
//         common.ErTitleEnum.OPTIONS_PARAMETER_MUST_BE_A_NUMBER,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof common.FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               constants.LINE_NUM) as keyof common.FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }

// if (
//   [
//     // common.ParameterEnum.StartAngle.toString(),
//     // common.ParameterEnum.XScaleMax.toString(),
//     // common.ParameterEnum.YScaleMin.toString(),
//     // common.ParameterEnum.YScaleMax.toString()
//   ].indexOf(parameter) > -1 &&
//   !(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ).match(common.MyRegex.CAPTURE_MINUS_DIGITS_START_TO_END_G())
// ) {
//   item.errors.push(
//     new BmError({
//       title:
//         common.ErTitleEnum.OPTIONS_PARAMETER_MUST_BE_AN_INTEGER,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof common.FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               constants.LINE_NUM) as keyof common.FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }

// if (
//   [
//     // common.ParameterEnum.BandColor.toString(),
//     // common.ParameterEnum.CardColor.toString(),
//     // common.ParameterEnum.TextColor.toString(),
//     // common.ParameterEnum.EmptyColor.toString()
//   ].indexOf(parameter) > -1 &&
//   !(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ).match(common.MyRegex.CAPTURE_RGB_SPLIT_G()) &&
//   !(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ).match(common.MyRegex.CAPTURE_RGBA_SPLIT_G())
// ) {
//   item.errors.push(
//     new BmError({
//       title: common.ErTitleEnum.OPTIONS_WRONG_COLOR,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof common.FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               constants.LINE_NUM) as keyof common.FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }

// if (
//   [
//     // common.ParameterEnum.FormatNumberDataLabel.toString(),
//     // common.ParameterEnum.FormatNumberValue.toString(),
//     // common.ParameterEnum.FormatNumberAxisTick.toString(),
//     // common.ParameterEnum.FormatNumberYAxisTick.toString(),
//     // common.ParameterEnum.FormatNumberXAxisTick.toString()
//   ].indexOf(parameter) > -1
// ) {
//   let value = tile.options[
//     parameter as keyof common.FileChartOptions
//   ] as any;
//   try {
//     formatSpecifier(value);
//   } catch (e) {
//     item.errors.push(
//       new BmError({
//         title: common.ErTitleEnum.WRONG_FORMAT_NUMBER,
//         message: ` ${parameter} value "${value}" is not valid`,
//         lines: [
//           {
//             line: tile.options[
//               (parameter +
//                 constants.LINE_NUM) as keyof common.FileChartOptions
//             ] as number,
//             name: x.fileName,
//             path: x.filePath
//           }
//         ]
//       })
//     );
//     return;
//   }
// }

// if (
//   parameter === common.ParameterEnum.Interpolation &&
//   common.CHART_INTERPOLATION_VALUES.indexOf(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ) < 0
// ) {
//   item.errors.push(
//     new BmError({
//       title: common.ErTitleEnum.OPTIONS_WRONG_INTERPOLATION,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof common.FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               constants.LINE_NUM) as keyof common.FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }

// if (
//   parameter === common.ParameterEnum.ColorScheme &&
//   common.CHART_COLOR_SCHEME_VALUES.indexOf(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ) < 0
// ) {
//   item.errors.push(
//     new BmError({
//       title: common.ErTitleEnum.OPTIONS_WRONG_COLOR_SCHEME,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof common.FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               constants.LINE_NUM) as keyof common.FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }

// if (
//   parameter === common.ParameterEnum.SchemeType &&
//   common.CHART_SCHEME_TYPE_VALUES.indexOf(
//     tile.options[parameter as keyof common.FileChartOptions] as any
//   ) < 0
// ) {
//   item.errors.push(
//     new BmError({
//       title: common.ErTitleEnum.OPTIONS_WRONG_SCHEME_TYPE,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof common.FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               constants.LINE_NUM) as keyof common.FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }
