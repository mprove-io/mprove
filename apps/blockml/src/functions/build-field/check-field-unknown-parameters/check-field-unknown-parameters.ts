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

import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { sdrType } from '#common/types/blockml/parts/internal/sdr-type';

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
            ['name'.toString(), 'fieldClass'.toString()].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === 'hidden' &&
            !field[parameter].match(MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: 'WRONG_FIELD_HIDDEN',
                message: `parameter "hidden" must be 'true' or 'false' if specified`,
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
                  [
                    'dimension'.toString(),
                    'label'.toString(),
                    'description'.toString(),
                    'group'.toString(),
                    'time_group'.toString(),
                    'detail'.toString(),
                    'result'.toString(),
                    'format_number'.toString(),
                    'currency_prefix'.toString(),
                    'currency_suffix'.toString(),
                    'required'.toString(),
                    'meta'.toString()
                  ].indexOf(parameter) < 0) ||
                (['BuildDashboardField', 'BuildReportField'].indexOf(caller) >
                  -1 &&
                  [
                    'dimension'.toString(),
                    'hidden'.toString(),
                    'label'.toString(),
                    'description'.toString(),
                    'type'.toString(),
                    'result'.toString(),
                    'suggest_model_dimension'.toString(),
                    'format_number'.toString(),
                    'currency_prefix'.toString(),
                    'currency_suffix'.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_DIMENSION_PARAMETER',
                    message: `parameter "${parameter}" cannot be used with dimension in ${x.fileExt} file`,
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
                [
                  'measure'.toString(),
                  'label'.toString(),
                  'description'.toString(),
                  'result'.toString(),
                  'group'.toString(),
                  'format_number'.toString(),
                  'currency_prefix'.toString(),
                  'currency_suffix'.toString(),
                  'required'.toString(),
                  'meta'.toString()
                ].indexOf(parameter) < 0
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_MEASURE_PARAMETER',
                    message: `parameter "${parameter}" cannot be used with measure in ${x.fileExt} file`,
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
                  [
                    'filter'.toString(),
                    'label'.toString(),
                    'description'.toString(),
                    'max_fractions'.toString(),
                    'required'.toString(),
                    'fraction_controls'.toString()
                  ].indexOf(parameter) < 0) ||
                //
                (['BuildStoreField'].indexOf(caller) > -1 &&
                  ['conditions'.toString()].indexOf(parameter) > -1) ||
                //
                (['BuildDashboardField', 'BuildReportField'].indexOf(caller) >
                  -1 &&
                  [
                    'filter'.toString(),
                    'label'.toString(),
                    'description'.toString(),
                    'result'.toString(),
                    'suggest_model_dimension'.toString(),
                    'conditions'.toString(),
                    'fractions'.toString(),
                    'store_model'.toString(),
                    'store_filter'.toString(),
                    'store_result'.toString()
                  ].indexOf(parameter) < 0)
              ) {
                item.errors.push(
                  new BmError({
                    title: 'UNKNOWN_FILTER_PARAMETER',
                    message: `parameter "${parameter}" cannot be used with filter in ${x.fileExt} file`,
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
            [
              'timeframes'.toString(),
              'conditions'.toString(),
              'fractions'.toString(),
              'fraction_controls'.toString()
            ].indexOf(parameter) < 0
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
            ['meta'.toString()].indexOf(parameter) < 0
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
            [
              'timeframes'.toString(),
              'conditions'.toString(),
              'fractions'.toString(),
              'fraction_controls'.toString()
            ].indexOf(parameter) > -1
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
            parameter === 'fraction_controls'.toString()
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
