import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { vmdType } from './_vmd-type';

import { formatSpecifier } from 'd3-format';

let func = enums.FuncEnum.CheckAndSetImplicitFormatNumber;

export function checkAndSetImplicitFormatNumber<T extends vmdType>(item: {
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

    x.fields.forEach(field => {
      if (field.result === enums.FieldAnyResultEnum.Number) {
        if (helper.isUndefined(field.format_number)) {
          // set default
          field.format_number = '';
          field.format_number_line_num = 0;
        } else {
          try {
            formatSpecifier(field.format_number);
          } catch (e) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.WRONG_FORMAT_NUMBER,
                message: ` ${enums.ParameterEnum.FormatNumber} value "${field.format_number}" is not valid`,
                lines: [
                  {
                    line: field.format_number_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }

        if (helper.isUndefined(field.currency_prefix)) {
          // set default
          field.currency_prefix = '$';
          field.currency_prefix_line_num = 0;
        }

        if (helper.isUndefined(field.currency_suffix)) {
          // set default
          field.currency_suffix = '';
          field.currency_suffix_line_num = 0;
        }
      } else {
        if (helper.isUndefined(field.format_number)) {
          // error e268
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISUSE_OF_FORMAT_NUMBER,
              message:
                `${enums.ParameterEnum.FormatNumber} can only be used with fields where ${enums.ParameterEnum.Result} is "${enums.FieldAnyResultEnum.Number}". ` +
                `Found field ${enums.ParameterEnum.Result} "${field.result}".`,
              lines: [
                {
                  line: field.format_number_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (helper.isDefined(field.currency_prefix)) {
          // error e269
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISUSE_OF_CURRENCY_PREFIX,
              message:
                `${enums.ParameterEnum.CurrencyPrefix} can only be used with fields where ${enums.ParameterEnum.Result} is "${enums.FieldAnyResultEnum.Number}". ` +
                `Found field ${enums.ParameterEnum.Result} "${field.result}".`,
              lines: [
                {
                  line: field.currency_prefix_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (helper.isDefined(field.currency_suffix)) {
          // error e270
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISUSE_OF_CURRENCY_SUFFIX,
              message:
                `${enums.ParameterEnum.CurrencySuffix} can only be used with fields where ${enums.ParameterEnum.Result} is "${enums.FieldAnyResultEnum.Number}". ` +
                `Found field ${enums.ParameterEnum.Result} "${field.result}".`,
              lines: [
                {
                  line: field.currency_suffix_line_num,
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

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
