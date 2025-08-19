import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckAndSetImplicitResult;

export function checkAndSetImplicitResult<T extends sdrType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
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
      if (
        [CallerEnum.BuildReportField, CallerEnum.BuildDashboardField].indexOf(
          caller
        ) > -1
      ) {
        if (isUndefined(field.result)) {
          switch (field.fieldClass) {
            case FieldClassEnum.Filter: {
              if (
                isUndefined(field.store_model) &&
                isUndefined(field.store_filter) &&
                isUndefined(field.store_result)
              ) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.MISSING_FILTER_RESULT,
                    message: `parameter ${ParameterEnum.Result} is required for filters`,
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
            case FieldClassEnum.Filter: {
              if (FILTER_RESULT_VALUES.indexOf(field.result) < 0) {
                item.errors.push(
                  new BmError({
                    title: ErTitleEnum.WRONG_FILTER_RESULT,
                    message: `"${field.result}" is not valid result for ${FieldClassEnum.Filter}`,
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

      if (caller === CallerEnum.BuildStoreField) {
        if (
          isUndefined(field.result) &&
          field.fieldClass !== FieldClassEnum.Filter
        ) {
          let fieldKeysLineNums: number[] = Object.keys(field)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => field[y as keyof FieldAny] as number)
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_STORE_FIELD_RESULT,
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

        let results = (x as FileStore).results.map(r => r.result);

        if (
          isDefined(field.result) &&
          field.fieldClass !== FieldClassEnum.Filter &&
          results.indexOf(field.result) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_STORE_FIELD_RESULT,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}
