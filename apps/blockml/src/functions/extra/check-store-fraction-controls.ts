import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileErrorLine } from '#common/interfaces/blockml/internal/file-error-line';
import { FileStoreFractionControl } from '#common/interfaces/blockml/internal/file-store-fraction-control';
import { MyRegex } from '#common/models/my-regex';
import { checkStoreFractionControlOptions } from './check-store-fraction-control-options';
import { log } from './log';

let func = FuncEnum.CheckStoreFractionControls;

export function checkStoreFractionControls(
  item: {
    skipOptions: boolean;
    controls: FileStoreFractionControl[];
    controlsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, skipOptions } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  item.controls.forEach(control => {
    if (isDefined(control) && control.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.CONTROLS_ELEMENT_IS_NOT_A_DICTIONARY,
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
      .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            ParameterEnum.Input.toString(),
            ParameterEnum.ListInput.toString(),
            ParameterEnum.Switch.toString(),
            ParameterEnum.DatePicker.toString(),
            ParameterEnum.Selector.toString(),
            ParameterEnum.Options.toString(),
            ParameterEnum.Value.toString(),
            ParameterEnum.Label.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNKNOWN_CONTROLS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" cannot be used in ${ParameterEnum.FractionTypes} element controls`,
              lines: [
                {
                  line: control[
                    (parameter + LINE_NUM) as keyof FileStoreFractionControl
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
          [ParameterEnum.Options.toString()].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: control[
                    (parameter + LINE_NUM) as keyof FileStoreFractionControl
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
              title: ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: control[
                    (parameter + LINE_NUM) as keyof FileStoreFractionControl
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
        .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => control[y as keyof FileStoreFractionControl] as number);

      if (
        skipOptions === false &&
        isDefined(control.selector) &&
        isUndefined(control.options)
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_OPTIONS,
            message: `${ParameterEnum.Selector} must have "${ParameterEnum.Options}" parameter`,
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
        skipOptions === false &&
        isDefined(control.options) &&
        isUndefined(control.selector)
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.OPTIONS_WITHOUT_SELECTOR,
            message: `${ParameterEnum.Options} can only be used with "${ParameterEnum.Selector}" control`,
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
        skipOptions === false &&
        errorsOnStart === item.errors.length &&
        isDefined(control.options)
      ) {
        checkStoreFractionControlOptions(
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
            ParameterEnum.Input.toString(),
            ParameterEnum.ListInput.toString(),
            ParameterEnum.Switch.toString(),
            ParameterEnum.DatePicker.toString(),
            ParameterEnum.Selector.toString()
          ].indexOf(d) > -1
      );

      if (declarations.length === 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_CONTROL_DECLARATION,
            message: `control must contain one of parameters: ${ParameterEnum.Input}, ${ParameterEnum.Switch}, ${ParameterEnum.DatePicker}, ${ParameterEnum.Selector}`,
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
            title: ErTitleEnum.TOO_MANY_DECLARATIONS_FOR_ONE_CONTROL,
            message: `control must contain only one of parameters:${ParameterEnum.Input}, ${ParameterEnum.Switch}, ${ParameterEnum.DatePicker}, ${ParameterEnum.Selector}`,
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
        (control[declaration as keyof FileStoreFractionControl] as any).match(
          MyRegex.CAPTURE_NOT_ALLOWED_CONTROL_NAME_CHARS_G()
        )
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.WRONG_CHARS_IN_CONTROL_NAME,
            message: `parameter "${declaration}" contains wrong characters or whitespace (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: control[
                  (declaration + LINE_NUM) as keyof FileStoreFractionControl
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
        controlClass as keyof FileStoreFractionControl
      ] as string;

      let controNameLineNum = control[
        (controlClass + LINE_NUM) as keyof FileStoreFractionControl
      ] as number;

      delete control[controlClass as keyof FileStoreFractionControl];
      delete control[
        (controlClass + LINE_NUM) as keyof FileStoreFractionControl
      ];

      let newControlProps: FileStoreFractionControl = {
        name: controlName,
        name_line_num: controNameLineNum,
        controlClass: <ControlClassEnum>controlClass,
        isMetricsDate:
          <ControlClassEnum>controlClass === ControlClassEnum.DatePicker &&
          isDefined(control.value) &&
          control.value.toString().split('$METRICS_DATE_').length > 1
      };

      Object.assign(control, newControlProps);
    }
  });

  if (errorsOnStart === item.errors.length) {
    let cElements: {
      controlName: string;
      controlNameLineNums: number[];
    }[] = [];

    item.controls.forEach(control => {
      let cElement = cElements.find(c => c.controlName === control.name);

      if (isDefined(cElement)) {
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
        let lines: FileErrorLine[] = ce.controlNameLineNums.map(y => ({
          line: y,
          name: item.fileName,
          path: item.filePath
        }));

        item.errors.push(
          new BmError({
            title: ErTitleEnum.DUPLICATE_CONTROL_NAMES,
            message: 'Controls must have unique names',
            lines: lines
          })
        );
        return;
      }
    });
  }

  return item.errors;
}
