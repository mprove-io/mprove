import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkStoreFractionControls } from '#blockml/functions/check-store-fraction-controls/check-store-fraction-controls';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { sdrType } from '#common/types/blockml/parts/internal/sdr-type';

const visualizationFieldCallers = [
  'BuildDashboardField',
  'BuildReportField'
] satisfies Caller[];

const fieldArrayParameters = [
  'timeframes',
  'conditions',
  'fractions',
  'fraction_controls'
] satisfies FileParameter[];

let func: Func = 'build-field/check-field-unknown-parameters';

export function checkFieldUnknownParameters<T extends sdrType>(item: {
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
      Object.keys(field)
        .filter(
          k =>
            !k.match(MyRegex.ENDS_WITH_LINE_NUM()) &&
            (['name', 'fieldClass'] satisfies FileParameter[]).findIndex(
              candidate => candidate === k
            ) < 0
        )
        .forEach(parameter => {
          if (
            parameter === ('hidden' satisfies FileParameter) &&
            !field[parameter].match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: 'WRONG_FIELD_HIDDEN',
                message: `parameter "${'hidden' satisfies FileParameter}" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          switch (field.fieldClass) {
            case 'dimension': {
              if (
                (caller === 'BuildStoreField' &&
                  (
                    [
                      'dimension',
                      'label',
                      'description',
                      'group',
                      'time_group',
                      'detail',
                      'result',
                      'format_number',
                      'currency_prefix',
                      'currency_suffix',
                      'required',
                      'meta'
                    ] satisfies FileParameter[]
                  ).findIndex(candidate => candidate === parameter) < 0) ||
                (visualizationFieldCallers.some(
                  candidate => candidate === caller
                ) &&
                  (
                    [
                      'dimension',
                      'hidden',
                      'label',
                      'description',
                      'type',
                      'result',
                      'suggest_model_dimension',
                      'format_number',
                      'currency_prefix',
                      'currency_suffix'
                    ] satisfies FileParameter[]
                  ).findIndex(candidate => candidate === parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_DIMENSION_PARAMETER',
                    message: `parameter "${parameter}" cannot be used with ${'dimension' satisfies FieldClass} in ${x.fileExt} file`,
                    lines: [
                      {
                        line: field[
                          (parameter + LINE_NUM) as keyof FieldAny
                        ] as number,
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

            case 'measure': {
              if (
                caller === 'BuildStoreField' &&
                (
                  [
                    'measure',
                    'label',
                    'description',
                    'result',
                    'group',
                    'format_number',
                    'currency_prefix',
                    'currency_suffix',
                    'required',
                    'meta'
                  ] satisfies FileParameter[]
                ).findIndex(candidate => candidate === parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_MEASURE_PARAMETER',
                    message: `parameter "${parameter}" cannot be used with ${'measure' satisfies FieldClass} in ${x.fileExt} file`,
                    lines: [
                      {
                        line: field[
                          (parameter + LINE_NUM) as keyof FieldAny
                        ] as number,
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

            case 'filter': {
              if (
                (caller === 'BuildStoreField' &&
                  (
                    [
                      'filter',
                      'label',
                      'description',
                      'max_fractions',
                      'required',
                      'fraction_controls'
                    ] satisfies FileParameter[]
                  ).findIndex(candidate => candidate === parameter) < 0) ||
                //
                (caller === 'BuildStoreField' &&
                  parameter === ('conditions' satisfies FileParameter)) ||
                //
                (visualizationFieldCallers.some(
                  candidate => candidate === caller
                ) &&
                  (
                    [
                      'filter',
                      'label',
                      'description',
                      'result',
                      'suggest_model_dimension',
                      'conditions',
                      'fractions',
                      'store_model',
                      'store_filter',
                      'store_result'
                    ] satisfies FileParameter[]
                  ).findIndex(candidate => candidate === parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_FILTER_PARAMETER',
                    message: `parameter "${parameter}" cannot be used with ${'filter' satisfies FieldClass} in ${x.fileExt} file`,
                    lines: [
                      {
                        line: field[
                          (parameter + LINE_NUM) as keyof FieldAny
                        ] as number,
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
          }

          if (
            Array.isArray(field[parameter as keyof FieldAny]) &&
            fieldArrayParameters.findIndex(
              candidate => candidate === parameter
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: 'UNEXPECTED_LIST',
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            field[parameter as keyof FieldAny]?.constructor === Object &&
            parameter !== ('meta' satisfies FileParameter)
          ) {
            item.errors.push(
              new BmError({
                title: 'UNEXPECTED_DICTIONARY',
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            !Array.isArray(field[parameter as keyof FieldAny]) &&
            fieldArrayParameters.some(candidate => candidate === parameter)
          ) {
            item.errors.push(
              new BmError({
                title: 'PARAMETER_IS_NOT_A_LIST',
                message: `parameter "${parameter}" must be a List`,
                lines: [
                  {
                    line: field[
                      (parameter + LINE_NUM) as keyof FieldAny
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            errorsOnStart === item.errors.length &&
            parameter === ('fraction_controls' satisfies FileParameter)
          ) {
            checkStoreFractionControls(
              {
                skipOptions: false,
                controls: field.fraction_controls,
                controlsLineNum: field.fraction_controls_line_num,
                fileName: x.fileName,
                filePath: x.filePath,
                structId: item.structId,
                errors: item.errors,
                caller: item.caller
              },
              cs
            );
          }
        });
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return Result.succeed(newEntities);
}
