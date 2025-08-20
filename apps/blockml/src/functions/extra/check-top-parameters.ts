import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FieldFilter } from '~common/interfaces/blockml/internal/field-filter';
import { FieldStoreFilter } from '~common/interfaces/blockml/internal/field-store-filter';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { FileStoreResult } from '~common/interfaces/blockml/internal/file-store-result';
import { MyRegex } from '~common/models/my-regex';
import { checkStoreFraction } from './check-store-fraction';
import { checkStoreFractionControls } from './check-store-fraction-controls';
import { checkStoreFractionControlsUse } from './check-store-fraction-controls-use';
import { log } from './log';

let func = FuncEnum.CheckStoreFractionControls;

export function checkTopParameters(
  item: {
    fields: FieldFilter[];
    stores: FileStore[];
    parametersLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, stores } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.fields.forEach(field => {
    let errorsOnStart = item.errors.length;

    let fieldLineNums: number[] = Object.keys(field)
      .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
      .map(y => field[y as keyof FieldFilter] as number)
      .filter(n => n !== 0);

    if (isDefined(field.result) && isDefined(field.store_model)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_RESULT_AND_STORE,
          message: `filter parameters "result" and "store" do not work together`,
          lines: [
            {
              line: field.result_line_num,
              name: item.fileName,
              path: item.filePath
            },
            {
              line: field.store_model_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(field.result) && isDefined(field.store_filter)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_RESULT_AND_STORE_FILTER,
          message: `filter parameters "result" and "store_filter" do not work together`,
          lines: [
            {
              line: field.result_line_num,
              name: item.fileName,
              path: item.filePath
            },
            {
              line: field.store_filter_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(field.result) && isDefined(field.store_result)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_RESULT_AND_STORE_RESULT,
          message: `filter parameters "result" and "store_result" do not work together`,
          lines: [
            {
              line: field.result_line_num,
              name: item.fileName,
              path: item.filePath
            },
            {
              line: field.store_result_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(field.store_filter) && isDefined(field.store_result)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_STORE_FILTER_AND_STORE_RESULT,
          message: `filter parameters "store_filter" and "store_result" do not work together`,
          lines: [
            {
              line: field.store_filter_line_num,
              name: item.fileName,
              path: item.filePath
            },
            {
              line: field.store_result_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(field.store_filter) && isUndefined(field.store_model)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_STORE_FILTER_WITHOUT_STORE,
          message: `filter parameter "store" is required for "store_filter" to work`,
          lines: [
            {
              line: field.store_filter_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(field.store_result) && isUndefined(field.store_model)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_STORE_RESULT_WITHOUT_STORE,
          message: `filter parameter "store" is required for "store_result" to work`,
          lines: [
            {
              line: field.store_result_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      isDefined(field.store_model) &&
      isUndefined(field.store_filter) &&
      isUndefined(field.store_result)
    ) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.TOP_PARAMETERS_STORE_ONLY,
          message: `filter parameter "store_filter" or "store_result" is required when "store" specified`,
          lines: [
            {
              line: field.store_model_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(field.store_model)) {
      let store = stores.find(m => m.name === field.store_model);

      if (isUndefined(store)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.TOP_PARAMETER_REFS_MISSING_STORE,
            message: `store "${field.store_model}" is missing or not valid`,
            lines: [
              {
                line: field.store_model_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let storeFilter: FieldStoreFilter;

      if (isDefined(field.store_filter)) {
        storeFilter = store.fields.find(
          sField => sField.name === field.store_filter
        );

        if (isUndefined(storeFilter)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TOP_PARAMETER_REFS_MISSING_STORE_FILTER,
              message: `store filter "${field.store_filter}" is missing or not valid`,
              lines: [
                {
                  line: field.store_filter_line_num,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );
          return;
        }
      }

      let storeResult: FileStoreResult;

      if (isDefined(field.store_result)) {
        storeResult = store.results.find(
          sResult => sResult.result === field.store_result
        );

        if (isUndefined(storeResult)) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.TOP_PARAMETER_REFS_MISSING_STORE_RESULT,
              message: `store result "${field.store_result}" is missing or not valid`,
              lines: [
                {
                  line: field.store_result_line_num,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );
          return;
        }
      }

      if (isUndefined(field.fractions)) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MISSING_FRACTIONS,
            message: `fractions parameter is required`,
            lines: [
              {
                line: Math.min(...fieldLineNums),
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (field.fractions.length === 0) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.FRACTIONS_LIST_IS_EMPTY,
            message: `fractions cannot be empty`,
            lines: [
              {
                line: field.fractions_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (
        isDefined(storeFilter?.max_fractions) &&
        field.fractions.length > Number(storeFilter.max_fractions)
      ) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.MAX_FRACTIONS_EXCEEDED,
            message: `fractions length ${
              field.fractions.length
            } exceeded store filter max_fractions ${Number(
              storeFilter.max_fractions
            )}`,
            lines: [
              {
                line: field.fractions_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      checkStoreFraction(
        {
          storeFilter: isDefined(field.store_filter) ? storeFilter : undefined,
          storeResult: field.store_result,
          storeFractionTypes: storeResult?.fraction_types,
          fractions: field.fractions,
          fractionsLineNum: field.fractions_line_num,
          fileName: item.fileName,
          filePath: item.filePath,
          structId: item.structId,
          errors: item.errors,
          caller: item.caller
        },
        cs
      );

      if (errorsOnStart === item.errors.length) {
        field.fractions.forEach(fraction => {
          checkStoreFractionControls(
            {
              skipOptions: true,
              controls: fraction.controls,
              controlsLineNum: fraction.controls_line_num,
              fileName: item.fileName,
              filePath: item.filePath,
              structId: item.structId,
              errors: item.errors,
              caller: item.caller
            },
            cs
          );

          if (errorsOnStart === item.errors.length) {
            checkStoreFractionControlsUse(
              {
                controls: fraction.controls,
                storeControls: isDefined(storeFilter)
                  ? storeFilter.fraction_controls
                  : storeResult.fraction_types.find(
                      ft => ft.type === fraction.type
                    ).controls,
                controlsLineNum: fraction.controls_line_num,
                fileName: item.fileName,
                filePath: item.filePath,
                structId: item.structId,
                errors: item.errors,
                caller: item.caller
              },
              cs
            );
          }
        });
      }
    }
  });

  return item.errors;
}
