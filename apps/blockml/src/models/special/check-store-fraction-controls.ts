import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreFractionControl } from '~common/_index';

let func = common.FuncEnum.CheckStoreFractionControls;

export function checkStoreFractionControls(
  item: {
    controls: common.FileStoreFractionControl[];
    controlsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  let controlNames: { controlName: string; controlNameLineNums: number[] }[] =
    [];

  item.controls.forEach(control => {
    if (common.isDefined(control) && control.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.CONTROLS_ELEMENT_IS_NOT_A_DICTIONARY,
          message: `found at least one controls element that is not a dictionary`,
          lines: [
            {
              line: item.controlsLineNum,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    Object.keys(control)
      .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            common.ParameterEnum.Input.toString(),
            common.ParameterEnum.Switch.toString(),
            common.ParameterEnum.DatePicker.toString(),
            common.ParameterEnum.Selector.toString(),
            common.ParameterEnum.Options.toString(),
            common.ParameterEnum.Value.toString(),
            common.ParameterEnum.Label.toString(),
            common.ParameterEnum.IsArray.toString(),
            common.ParameterEnum.ShowIf.toString(),
            common.ParameterEnum.Required.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNKNOWN_CONTROLS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.FractionTypes} element`,
              lines: [
                {
                  line: control[
                    (parameter +
                      constants.LINE_NUM) as keyof FileStoreFractionControl
                  ] as number,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );
          return;
        }

        // if (
        //   Array.isArray(control[parameter as keyof FileStoreFractionType]) &&
        //   [common.ParameterEnum.Controls.toString()].indexOf(parameter) < 0
        // ) {
        //   item.errors.push(
        //     new BmError({
        //       title: common.ErTitleEnum.UNEXPECTED_LIST,
        //       message: `parameter "${parameter}" must have a single value`,
        //       lines: [
        //         {
        //           line: control[
        //             (parameter +
        //               constants.LINE_NUM) as keyof FileStoreFractionType
        //           ],
        //           name: item.fileName,
        //           path: item.filePath
        //         }
        //       ]
        //     })
        //   );
        //   return;
        // }

        // if (
        //   control[parameter as keyof FileStoreFractionType]?.constructor ===
        //   Object
        // ) {
        //   item.errors.push(
        //     new BmError({
        //       title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
        //       message: `parameter "${parameter}" must have a single value`,
        //       lines: [
        //         {
        //           line: control[
        //             (parameter +
        //               constants.LINE_NUM) as keyof FileStoreFractionType
        //           ],
        //           name: item.fileName,
        //           path: item.filePath
        //         }
        //       ]
        //     })
        //   );
        //   return;
        // }
      });

    if (errorsOnStart === item.errors.length) {
      // let fractionTypeElementKeyLineNums: number[] = Object.keys(control)
      //   .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      //   .map(y => control[y as keyof FileStoreFractionType]);
      // if (common.isUndefined(control.type)) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.MISSING_TYPE,
      //       message: `${common.ParameterEnum.FractionTypes} element must have "${common.ParameterEnum.Type}" parameter`,
      //       lines: [
      //         {
      //           line: Math.min(...fractionTypeElementKeyLineNums),
      //           name: item.fileName,
      //           path: item.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }
      // if (common.isUndefined(control.controls)) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.MISSING_CONTROLS,
      //       message: `${common.ParameterEnum.FractionTypes} element must have "${common.ParameterEnum.Controls}" parameter`,
      //       lines: [
      //         {
      //           line: Math.min(...fractionTypeElementKeyLineNums),
      //           name: item.fileName,
      //           path: item.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }
      // if (
      //   common.isDefined(control.or) &&
      //   !control.or.match(common.MyRegex.TRUE_FALSE())
      // ) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.WRONG_OR,
      //       message: `parameter "${common.ParameterEnum.Or}" must be 'true' or 'false' if specified`,
      //       lines: [
      //         {
      //           line: control.or_line_num,
      //           name: item.fileName,
      //           path: item.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }
      // if (
      //   common.isDefined(control.and_not) &&
      //   !control.and_not.match(common.MyRegex.TRUE_FALSE())
      // ) {
      //   item.errors.push(
      //     new BmError({
      //       title: common.ErTitleEnum.WRONG_AND_NOT,
      //       message: `parameter "${common.ParameterEnum.AndNot}" must be 'true' or 'false' if specified`,
      //       lines: [
      //         {
      //           line: control.and_not_line_num,
      //           name: item.fileName,
      //           path: item.filePath
      //         }
      //       ]
      //     })
      //   );
      //   return;
      // }
    }

    // if (errorsOnStart === item.errors.length) {
    //   let index = controlNames.findIndex(
    //     fractionType => fractionType.controlName === control.type
    //   );

    //   if (index > -1) {
    //     controlNames[index].controlNameLineNums.push(control.type_line_num);
    //   } else {
    //     controlNames.push({
    //       controlName: control.type,
    //       controlNameLineNums: [control.type_line_num]
    //     });
    //   }
    // }
  });

  if (errorsOnStart === item.errors.length) {
    controlNames.forEach(frType => {
      if (frType.controlNameLineNums.length > 1) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.DUPLICATE_TYPES,
            message: `"${common.ParameterEnum.Type}" value must be unique across ${common.ParameterEnum.FractionTypes} elements`,
            lines: frType.controlNameLineNums.map(l => ({
              line: l,
              name: item.fileName,
              path: item.filePath
            }))
          })
        );
        return;
      }

      //

      let typeWrongChars: string[] = [];

      let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_RESULT_CHARS_G();
      let r2;

      while ((r2 = reg2.exec(frType.controlName))) {
        typeWrongChars.push(r2[1]);
      }

      let typeWrongCharsString = '';

      if (typeWrongChars.length > 0) {
        typeWrongCharsString = [...new Set(typeWrongChars)].join(', '); // unique

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_CHARS_IN_TYPE,
            message: `Characters "${typeWrongCharsString}" can not be used for result (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: frType.controlNameLineNums[0],
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return false;
      }
    });
  }

  return item.errors;
}
