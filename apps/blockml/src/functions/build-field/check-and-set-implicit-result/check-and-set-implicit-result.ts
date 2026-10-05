import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { FILTER_RESULT_VALUES } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { sdrType } from '#common/types/blockml/parts/internal/sdr-type';

let func: Func = 'build-field/check-and-set-implicit-result';

export function checkAndSetImplicitResult<T extends sdrType>(item: {
  entities: T[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { caller, structId, cs } = item;

  log(cs, caller, func, structId, 'input.log', item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(field => {
      if (
        (['BuildReportField', 'BuildDashboardField'] satisfies Caller[]).some(
          candidate => candidate === caller
        )
      ) {
        if (isUndefined(field.result)) {
          switch (field.fieldClass) {
            case 'filter': {
              if (
                isUndefined(field.store_model) &&
                isUndefined(field.store_filter) &&
                isUndefined(field.store_result)
              ) {
                item.errors.push(
                  new BmError({
                    title: 'MISSING_FILTER_RESULT',
                    message: `parameter ${'result' satisfies FileParameter} is required for filters`,
                    lines: [
                      {
                        line: field.name_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }
            }
          }
        } else {
          switch (field.fieldClass) {
            case 'filter': {
              if (FILTER_RESULT_VALUES.indexOf(field.result) < 0) {
                item.errors.push(
                  new BmError({
                    title: 'WRONG_FILTER_RESULT',
                    message: `"${field.result}" is not valid result for ${'filter' satisfies FieldClass}`,
                    lines: [
                      {
                        line: field.result_line_num,
                        name: x.fileName,
                        path: x.filePath
                      }
                    ]
                  })
                );
                return;
              }
              break;
            }
            // no need to check Time result (result is not set by user)
          }
        }
      }

      if (caller === 'BuildStoreField') {
        if (isUndefined(field.result) && field.fieldClass !== 'filter') {
          let fieldKeysLineNums: number[] = Object.keys(field)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => field[y as keyof FieldAny] as number)
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: 'MISSING_STORE_FIELD_RESULT',
              message: `field "${field.result}" is requred`,
              lines: [
                {
                  line: Math.min(...fieldKeysLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        let results: string[] = (x as FileStore).results.map(r => r.result);

        if (
          isDefined(field.result) &&
          field.fieldClass !== 'filter' &&
          results.indexOf(field.result) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'WRONG_STORE_FIELD_RESULT',
              message: `field ${field.result} must be one of store results`,
              lines: [
                {
                  line: field.result_line_num,
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
