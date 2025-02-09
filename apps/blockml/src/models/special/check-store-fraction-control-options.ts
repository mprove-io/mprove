import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreFractionControlOption } from '~common/_index';

let func = common.FuncEnum.CheckStoreFractionControlOptions;

export function checkStoreFractionControlOptions(
  item: {
    options: common.FileStoreFractionControlOption[];
    optionsLineNum: number;
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

  item.options.forEach(option => {
    if (common.isDefined(option) && option.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.OPTIONS_ELEMENT_IS_NOT_A_DICTIONARY,
          message: `found at least one options element that is not a dictionary`,
          lines: [
            {
              line: item.optionsLineNum,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    Object.keys(option)
      .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            common.ParameterEnum.Value.toString(),
            common.ParameterEnum.Label.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNKNOWN_OPTIONS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.Options} element`,
              lines: [
                {
                  line: option[
                    (parameter +
                      constants.LINE_NUM) as keyof FileStoreFractionControlOption
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
          Array.isArray(
            option[parameter as keyof FileStoreFractionControlOption]
          )
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: option[
                    (parameter +
                      constants.LINE_NUM) as keyof FileStoreFractionControlOption
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
          option[parameter as keyof FileStoreFractionControlOption]
            ?.constructor === Object
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: option[
                    (parameter +
                      constants.LINE_NUM) as keyof FileStoreFractionControlOption
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
      let optionsElementKeyLineNums: number[] = Object.keys(option)
        .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => option[y as keyof FileStoreFractionControlOption] as number);

      if (common.isUndefined(option.value)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_OPTION_VALUE,
            message: `${common.ParameterEnum.Options} element must have "${common.ParameterEnum.Value}" parameter`,
            lines: [
              {
                line: Math.min(...optionsElementKeyLineNums),
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let declarations: string[] = Object.keys(option).filter(
        d =>
          [
            common.ParameterEnum.Input.toString(),
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
                line: Math.min(...optionsElementKeyLineNums),
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
                line: Math.min(...optionsElementKeyLineNums),
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }
    }
  });

  let optionElements: {
    optionValue: string;
    optionValueLineNums: number[];
  }[] = [];

  item.options.forEach(option => {
    let optionElement = optionElements.find(
      c => c.optionValue === option.value
    );

    if (common.isDefined(optionElement)) {
      optionElement.optionValueLineNums.push(option.value_line_num);
    } else {
      optionElements.push({
        optionValue: option.value,
        optionValueLineNums: [option.value_line_num]
      });
    }
  });

  optionElements.forEach(ce => {
    if (ce.optionValueLineNums.length > 1) {
      let lines: common.FileErrorLine[] = ce.optionValueLineNums.map(y => ({
        line: y,
        name: item.fileName,
        path: item.filePath
      }));

      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.DUPLICATE_OPTION_VALUES,
          message: 'Options must have unique values',
          lines: lines
        })
      );
      return;
    }
  });

  return item.errors;
}
