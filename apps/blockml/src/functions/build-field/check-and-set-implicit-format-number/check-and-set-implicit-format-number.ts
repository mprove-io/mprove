import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { formatSpecifier } from 'd3-format';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileProjectConf } from '#common/types/blockml/parts/internal/file-project-conf';
import type { sdrType } from '#common/types/blockml/parts/internal/sdr-type';

let func: Func = 'build-field/check-and-set-implicit-format-number';

export function checkAndSetImplicitFormatNumber<T extends sdrType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  projectConfig: FileProjectConf;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (field.fieldClass === 'filter') {
        return;
      }

      if (field.result === 'number') {
        if (isUndefined(field.format_number)) {
          field.format_number = item.projectConfig.format_number;
          field.format_number_line_num = 0;
        } else {
          try {
            formatSpecifier(field.format_number);
          } catch (e) {
            item.errors.push(
              new BmError({
                title: 'WRONG_FORMAT_NUMBER',
                message: ` ${'format_number' satisfies FileParameter} value "${field.format_number}" is not valid`,
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
              title: 'MISUSE_OF_FORMAT_NUMBER',
              message:
                `${'format_number' satisfies FileParameter} can only be used with fields where ${'result' satisfies FileParameter} is "${'number' satisfies FieldResult}". ` +
                `Found field ${'result' satisfies FileParameter} "${field.result}".`,
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
              title: 'MISUSE_OF_CURRENCY_PREFIX',
              message:
                `${'currency_prefix' satisfies FileParameter} can only be used with fields where ${'result' satisfies FileParameter} is "${'number' satisfies FieldResult}". ` +
                `Found field ${'result' satisfies FileParameter} "${field.result}".`,
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
              title: 'MISUSE_OF_CURRENCY_SUFFIX',
              message:
                `${'currency_suffix' satisfies FileParameter} can only be used with fields where ${'result' satisfies FileParameter} is "${'number' satisfies FieldResult}". ` +
                `Found field ${'result' satisfies FileParameter} "${field.result}".`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
