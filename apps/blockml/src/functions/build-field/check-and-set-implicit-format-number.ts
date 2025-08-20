import { ConfigService } from '@nestjs/config';
import { formatSpecifier } from 'd3-format';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FileProjectConf } from '~common/interfaces/blockml/internal/file-project-conf';
import { sdrType } from '~common/types/sdr-type';
import { log } from '../extra/log';

let func = FuncEnum.CheckAndSetImplicitFormatNumber;

export function checkAndSetImplicitFormatNumber<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    projectConfig: FileProjectConf;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass === FieldClassEnum.Filter) {
        return;
      }

      if (field.result === FieldResultEnum.Number) {
        if (isUndefined(field.format_number)) {
          field.format_number = item.projectConfig.format_number;
          field.format_number_line_num = 0;
        } else {
          try {
            formatSpecifier(field.format_number);
          } catch (e) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.WRONG_FORMAT_NUMBER,
                message: ` ${ParameterEnum.FormatNumber} value "${field.format_number}" is not valid`,
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

        if (isUndefined(field.currency_prefix)) {
          field.currency_prefix = item.projectConfig.currency_prefix;
          field.currency_prefix_line_num = 0;
        }

        if (isUndefined(field.currency_suffix)) {
          field.currency_suffix = item.projectConfig.currency_suffix;
          field.currency_suffix_line_num = 0;
        }
      } else {
        if (isDefined(field.format_number)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISUSE_OF_FORMAT_NUMBER,
              message:
                `${ParameterEnum.FormatNumber} can only be used with fields where ${ParameterEnum.Result} is "${FieldResultEnum.Number}". ` +
                `Found field ${ParameterEnum.Result} "${field.result}".`,
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

        if (isDefined(field.currency_prefix)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISUSE_OF_CURRENCY_PREFIX,
              message:
                `${ParameterEnum.CurrencyPrefix} can only be used with fields where ${ParameterEnum.Result} is "${FieldResultEnum.Number}". ` +
                `Found field ${ParameterEnum.Result} "${field.result}".`,
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

        if (isDefined(field.currency_suffix)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISUSE_OF_CURRENCY_SUFFIX,
              message:
                `${ParameterEnum.CurrencySuffix} can only be used with fields where ${ParameterEnum.Result} is "${FieldResultEnum.Number}". ` +
                `Found field ${ParameterEnum.Result} "${field.result}".`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
