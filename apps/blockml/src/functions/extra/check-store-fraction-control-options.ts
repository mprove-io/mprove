import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileErrorLine } from '#common/interfaces/blockml/internal/file-error-line';
import { FileStoreFractionControlOption } from '#common/interfaces/blockml/internal/file-store-fraction-control-option';
import { MyRegex } from '#common/models/my-regex';
import { log } from './log';

let func = FuncEnum.CheckStoreFractionControlOptions;

export function checkStoreFractionControlOptions(
  item: {
    options: FileStoreFractionControlOption[];
    optionsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  item.options.forEach(option => {
    if (isDefined(option) && option.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.OPTIONS_ELEMENT_IS_NOT_A_DICTIONARY,
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
      .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            ParameterEnum.Value.toString(),
            ParameterEnum.Label.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNKNOWN_OPTIONS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" cannot be used in ${ParameterEnum.Options} element`,
              lines: [
                {
                  line: option[
                    (parameter +
                      LINE_NUM) as keyof FileStoreFractionControlOption
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
              title: ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: option[
                    (parameter +
                      LINE_NUM) as keyof FileStoreFractionControlOption
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
              title: ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: option[
                    (parameter +
                      LINE_NUM) as keyof FileStoreFractionControlOption
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
        .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .map(y => option[y as keyof FileStoreFractionControlOption] as number);

      if (isUndefined(option.value)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_OPTION_VALUE,
            message: `${ParameterEnum.Options} element must have "${ParameterEnum.Value}" parameter`,
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

    if (isDefined(optionElement)) {
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
      let lines: FileErrorLine[] = ce.optionValueLineNums.map(y => ({
        line: y,
        name: item.fileName,
        path: item.filePath
      }));

      item.errors.push(
        new BmError({
          title: ErTitleEnum.DUPLICATE_OPTION_VALUES,
          message: 'Options must have unique values',
          lines: lines
        })
      );
      return;
    }
  });

  return item.errors;
}
