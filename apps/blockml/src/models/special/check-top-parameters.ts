import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/constants/top';

let func = common.FuncEnum.CheckStoreFractionControls;

export function checkTopParameters(
  item: {
    fields: common.FieldFilter[];
    stores: common.FileStore[];
    parametersLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, stores } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.fields.forEach(field => {
    let fieldLineNums: number[] = Object.keys(field)
      .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      .map(y => field[y as keyof common.FieldFilter] as number);

    if (common.isDefined(field.result) && common.isDefined(field.store)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETERS_RESULT_AND_STORE,
          message: `filter parameters "result" and "store" do not work together`,
          lines: [
            {
              line: field.result_line_num,
              name: item.fileName,
              path: item.filePath
            },
            {
              line: field.store_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      common.isUndefined(field.result) &&
      common.isUndefined(field.store_result) &&
      common.isUndefined(field.store_filter)
    ) {
      item.errors.push(
        new BmError({
          title:
            common.ErTitleEnum
              .TOP_PARAMETERS_RESULT_OR_STORE_RESULT_OR_STORE_FILTER,
          message: `one of filter parameters ["result", "store_result" or "store_filter"] must be specified`,
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

    if (
      common.isDefined(field.result) &&
      common.isDefined(field.store_filter)
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETERS_RESULT_AND_STORE_FILTER,
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

    if (
      common.isDefined(field.result) &&
      common.isDefined(field.store_result)
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETERS_RESULT_AND_STORE_RESULT,
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

    if (
      common.isDefined(field.store_filter) &&
      common.isDefined(field.store_result)
    ) {
      item.errors.push(
        new BmError({
          title:
            common.ErTitleEnum.TOP_PARAMETERS_STORE_FILTER_AND_STORE_RESULT,
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

    if (
      common.isDefined(field.store_filter) &&
      common.isUndefined(field.store)
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETERS_STORE_FILTER_WITHOUT_STORE,
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

    if (
      common.isDefined(field.store_result) &&
      common.isUndefined(field.store)
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETERS_STORE_RESULT_WITHOUT_STORE,
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
      common.isDefined(field.store) &&
      common.isUndefined(field.store_filter) &&
      common.isUndefined(field.store_result)
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETERS_STORE_ONLY,
          message: `filter parameter "store_filter" or "store_result" is required when "store" specified`,
          lines: [
            {
              line: field.store_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (common.isDefined(field.store)) {
      let store = stores.find(
        m => `${STORE_MODEL_PREFIX}_${m.name}` === field.store
      );

      if (common.isUndefined(store)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.TOP_PARAMETER_REFS_MISSING_STORE,
            message: `store "${field.store}" is missing or not valid`,
            lines: [
              {
                line: field.store_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let storeFilter: common.FieldStoreFilter;

      if (common.isDefined(field.store_filter)) {
        storeFilter = store.fields.find(
          sField => sField.name === field.store_filter
        );

        if (common.isUndefined(storeFilter)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TOP_PARAMETER_REFS_MISSING_STORE_FILTER,
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

      let storeResult: common.FileStoreResult;

      if (common.isDefined(field.store_result)) {
        storeResult = store.results.find(
          sResult => sResult.result === field.store_result
        );

        if (common.isUndefined(storeResult)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.TOP_PARAMETER_REFS_MISSING_STORE_RESULT,
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

      if (common.isUndefined(field.fractions)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MISSING_FRACTIONS,
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

      if (
        common.isDefined(storeFilter?.max_fractions) &&
        field.fractions.length > Number(storeFilter.max_fractions)
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.MAX_FRACTIONS_EXCEEDED,
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

      barSpecial.checkStoreFraction(
        {
          storeFilter: common.isDefined(field.store_filter)
            ? storeFilter
            : undefined,
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

      field.fractions.forEach(fraction => {
        barSpecial.checkStoreFractionControls(
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
      });
    }
  });

  return item.errors;
}
