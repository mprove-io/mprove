import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
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
            common.ParameterEnum.ListInput.toString(),
            common.ParameterEnum.Switch.toString(),
            common.ParameterEnum.DatePicker.toString(),
            common.ParameterEnum.Selector.toString(),
            common.ParameterEnum.Options.toString(),
            common.ParameterEnum.Value.toString(),
            common.ParameterEnum.Label.toString(),
            common.ParameterEnum.ShowIf.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNKNOWN_CONTROLS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.FractionTypes} element controls`,
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

        if (
          Array.isArray(control[parameter as keyof FileStoreFractionControl]) &&
          [common.ParameterEnum.Options.toString()].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
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

        if (
          control[parameter as keyof FileStoreFractionControl]?.constructor ===
          Object
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
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
      });

    if (errorsOnStart === item.errors.length) {
      let controlsElementKeyLineNums: number[] = Object.keys(control)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => control[y as keyof FileStoreFractionControl] as number);

      if (
        common.isDefined(control.selector) &&
        common.isUndefined(control.options)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_OPTIONS,
            message: `${common.ParameterEnum.Selector} must have "${common.ParameterEnum.Options}" parameter`,
            lines: [
              {
                line: Math.min(...controlsElementKeyLineNums),
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        common.isDefined(control.options) &&
        common.isUndefined(control.selector)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.OPTIONS_WITHOUT_SELECTOR,
            message: `${common.ParameterEnum.Options} can only be used with "${common.ParameterEnum.Selector}" control`,
            lines: [
              {
                line: control.options_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        errorsOnStart === item.errors.length &&
        common.isDefined(control.options)
      ) {
        barSpecial.checkStoreFractionControlOptions(
          {
            options: control.options,
            optionsLineNum: control.options_line_num,
            fileName: item.fileName,
            filePath: item.filePath,
            structId: item.structId,
            errors: item.errors,
            caller: item.caller
          },
          cs
        );
      }

      let declarations: string[] = Object.keys(control).filter(
        d =>
          [
            common.ParameterEnum.Input.toString(),
            common.ParameterEnum.ListInput.toString(),
            common.ParameterEnum.Switch.toString(),
            common.ParameterEnum.DatePicker.toString(),
            common.ParameterEnum.Selector.toString()
          ].indexOf(d) > -1
      );

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_CONTROL_DECLARATION,
            message: `control must contain one of parameters: ${common.ParameterEnum.Input}, ${common.ParameterEnum.Switch}, ${common.ParameterEnum.DatePicker}, ${common.ParameterEnum.Selector}`,
            lines: [
              {
                line: Math.min(...controlsElementKeyLineNums),
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (declarations.length > 1) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_CONTROL,
            message: `control must contain only one of parameters:${common.ParameterEnum.Input}, ${common.ParameterEnum.Switch}, ${common.ParameterEnum.DatePicker}, ${common.ParameterEnum.Selector}`,
            lines: [
              {
                line: Math.min(...controlsElementKeyLineNums),
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let declaration = declarations[0];

      if (
        (
          control[declaration as keyof common.FileStoreFractionControl] as any
        ).match(common.MyRegex.CAPTURE_NOT_ALLOWED_CONTROL_NAME_CHARS_G())
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_CHARS_IN_CONTROL_NAME,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: control[
                  (declaration +
                    constants.LINE_NUM) as keyof common.FileStoreFractionControl
                ] as number,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let controlClass = declaration;
      let controlName = control[
        controlClass as keyof common.FileStoreFractionControl
      ] as string;

      let controNameLineNum = control[
        (controlClass +
          constants.LINE_NUM) as keyof common.FileStoreFractionControl
      ] as number;

      delete control[controlClass as keyof common.FileStoreFractionControl];
      delete control[
        (controlClass +
          constants.LINE_NUM) as keyof common.FileStoreFractionControl
      ];

      let newControlProps: common.FileStoreFractionControl = {
        name: controlName,
        name_line_num: controNameLineNum,
        controlClass: <common.ControlClassEnum>controlClass
      };

      Object.assign(control, newControlProps);
    }
  });

  let cElements: {
    controlName: string;
    controlNameLineNums: number[];
  }[] = [];

  item.controls.forEach(control => {
    let cElement = cElements.find(c => c.controlName === control.name);

    if (common.isDefined(cElement)) {
      cElement.controlNameLineNums.push(control.name_line_num);
    } else {
      cElements.push({
        controlName: control.name,
        controlNameLineNums: [control.name_line_num]
      });
    }
  });

  cElements.forEach(ce => {
    if (ce.controlNameLineNums.length > 1) {
      let lines: common.FileErrorLine[] = ce.controlNameLineNums.map(y => ({
        line: y,
        name: item.fileName,
        path: item.filePath
      }));

      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.DUPLICATE_CONTROL_NAMES,
          message: 'Controls must have unique names',
          lines: lines
        })
      );
      return;
    }
  });

  return item.errors;
}
