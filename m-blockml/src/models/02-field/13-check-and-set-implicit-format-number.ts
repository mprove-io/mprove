import { ConfigService } from '@nestjs/config';
import { formatSpecifier } from 'd3-format';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckAndSetImplicitFormatNumber;

export function checkAndSetImplicitFormatNumber<T extends types.vmdType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass === api.FieldClassEnum.Filter) {
        return;
      }

      if (field.result === api.FieldResultEnum.Number) {
        if (helper.isUndefined(field.format_number)) {
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
          field.currency_prefix = '$';
          field.currency_prefix_line_num = 0;
        }

        if (helper.isUndefined(field.currency_suffix)) {
          field.currency_suffix = '';
          field.currency_suffix_line_num = 0;
        }
      } else {
        if (helper.isDefined(field.format_number)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISUSE_OF_FORMAT_NUMBER,
              message:
                `${enums.ParameterEnum.FormatNumber} can only be used with fields where ${enums.ParameterEnum.Result} is "${api.FieldResultEnum.Number}". ` +
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
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISUSE_OF_CURRENCY_PREFIX,
              message:
                `${enums.ParameterEnum.CurrencyPrefix} can only be used with fields where ${enums.ParameterEnum.Result} is "${api.FieldResultEnum.Number}". ` +
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
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MISUSE_OF_CURRENCY_SUFFIX,
              message:
                `${enums.ParameterEnum.CurrencySuffix} can only be used with fields where ${enums.ParameterEnum.Result} is "${api.FieldResultEnum.Number}". ` +
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
