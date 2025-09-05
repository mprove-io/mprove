import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { FileChartOptions } from '~common/interfaces/blockml/internal/file-chart-options';
import { MyRegex } from '~common/models/my-regex';
import { drcType } from '~common/types/drc-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckChartOptionsParameters;

export function checkChartOptionsParameters<T extends drcType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.tiles.forEach(tile => {
      if (isUndefined(tile.options)) {
        return;
      }

      Object.keys(tile.options)
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              ParameterEnum.Format.toString(),
              ParameterEnum.XAxis.toString(),
              ParameterEnum.YAxis.toString(),
              ParameterEnum.Series.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_UNKNOWN_PARAMETER,
                message: `parameter "${parameter}" cannot be used inside options`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
              ParameterEnum.YAxis.toString(),
              ParameterEnum.Series.toString()
            ].indexOf(parameter) < 0 &&
            Array.isArray(
              tile.options[parameter as keyof FileChartOptions] as any
            )
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_UNEXPECTED_LIST,
                message: `parameter "${parameter}" cannot be a list`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            [ParameterEnum.XAxis.toString()].indexOf(parameter) < 0 &&
            (tile.options[parameter as keyof FileChartOptions] as any)
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" cannot be a dictionary`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            [ParameterEnum.Format.toString()].indexOf(parameter) > -1 &&
            !(tile.options[parameter as keyof FileChartOptions] as any)
              .toString()
              .match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_WRONG_PARAMETER_VALUE,
                message:
                  `parameter "${parameter}" value must be ` +
                  '"true" or "false" if specified',
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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
            !(tile.options[parameter as keyof FileChartOptions] as any).match(
              MyRegex.CAPTURE_DIGITS_START_TO_END_G()
            )
          ) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.OPTIONS_PARAMETER_MUST_BE_A_POSITIVE_INTEGER,
                message:
                  `"${
                    tile.options[parameter as keyof FileChartOptions] as any
                  }" is not valid ` + `"${parameter}" value`,
                lines: [
                  {
                    line: tile.options[
                      (parameter + LINE_NUM) as keyof FileChartOptions
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}

// if (
//   [
//     // ParameterEnum.ArcWidth.toString(),
//     // ParameterEnum.RangeFillOpacity.toString()
//   ].indexOf(parameter) > -1 &&
//   !(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ).match(MyRegex.CAPTURE_FLOAT_START_TO_END_G())
// ) {
//   item.errors.push(
//     new BmError({
//       title:
//         ErTitleEnum.OPTIONS_PARAMETER_MUST_BE_A_NUMBER,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               LINE_NUM) as keyof FileChartOptions
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
//     // ParameterEnum.StartAngle.toString(),
//     // ParameterEnum.XScaleMax.toString(),
//     // ParameterEnum.YScaleMin.toString(),
//     // ParameterEnum.YScaleMax.toString()
//   ].indexOf(parameter) > -1 &&
//   !(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ).match(MyRegex.CAPTURE_MINUS_DIGITS_START_TO_END_G())
// ) {
//   item.errors.push(
//     new BmError({
//       title:
//         ErTitleEnum.OPTIONS_PARAMETER_MUST_BE_AN_INTEGER,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               LINE_NUM) as keyof FileChartOptions
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
//     // ParameterEnum.BandColor.toString(),
//     // ParameterEnum.CardColor.toString(),
//     // ParameterEnum.TextColor.toString(),
//     // ParameterEnum.EmptyColor.toString()
//   ].indexOf(parameter) > -1 &&
//   !(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ).match(MyRegex.CAPTURE_RGB_SPLIT_G()) &&
//   !(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ).match(MyRegex.CAPTURE_RGBA_SPLIT_G())
// ) {
//   item.errors.push(
//     new BmError({
//       title: ErTitleEnum.OPTIONS_WRONG_COLOR,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               LINE_NUM) as keyof FileChartOptions
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
//     // ParameterEnum.FormatNumberDataLabel.toString(),
//     // ParameterEnum.FormatNumberValue.toString(),
//     // ParameterEnum.FormatNumberAxisTick.toString(),
//     // ParameterEnum.FormatNumberYAxisTick.toString(),
//     // ParameterEnum.FormatNumberXAxisTick.toString()
//   ].indexOf(parameter) > -1
// ) {
//   let value = tile.options[
//     parameter as keyof FileChartOptions
//   ] as any;
//   try {
//     formatSpecifier(value);
//   } catch (e) {
//     item.errors.push(
//       new BmError({
//         title: ErTitleEnum.WRONG_FORMAT_NUMBER,
//         message: ` ${parameter} value "${value}" is not valid`,
//         lines: [
//           {
//             line: tile.options[
//               (parameter +
//                 LINE_NUM) as keyof FileChartOptions
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
//   parameter === ParameterEnum.Interpolation &&
//   CHART_INTERPOLATION_VALUES.indexOf(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ) < 0
// ) {
//   item.errors.push(
//     new BmError({
//       title: ErTitleEnum.OPTIONS_WRONG_INTERPOLATION,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               LINE_NUM) as keyof FileChartOptions
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
//   parameter === ParameterEnum.ColorScheme &&
//   CHART_COLOR_SCHEME_VALUES.indexOf(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ) < 0
// ) {
//   item.errors.push(
//     new BmError({
//       title: ErTitleEnum.OPTIONS_WRONG_COLOR_SCHEME,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               LINE_NUM) as keyof FileChartOptions
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
//   parameter === ParameterEnum.SchemeType &&
//   CHART_SCHEME_TYPE_VALUES.indexOf(
//     tile.options[parameter as keyof FileChartOptions] as any
//   ) < 0
// ) {
//   item.errors.push(
//     new BmError({
//       title: ErTitleEnum.OPTIONS_WRONG_SCHEME_TYPE,
//       message:
//         `"${
//           tile.options[
//             parameter as keyof FileChartOptions
//           ] as any
//         }" is not valid ` + `"${parameter}" value`,
//       lines: [
//         {
//           line: tile.options[
//             (parameter +
//               LINE_NUM) as keyof FileChartOptions
//           ] as number,
//           name: x.fileName,
//           path: x.filePath
//         }
//       ]
//     })
//   );
//   return;
// }
