import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import { fractionLogicValues } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FieldStoreFilter } from '#common/types/blockml/parts/internal/field-store-filter';
import type { FileFraction } from '#common/types/blockml/parts/internal/file-fraction';
import type { FileStoreFractionType } from '#common/types/blockml/parts/internal/file-store-fraction-type';

let func: Func = 'extra/check-store-fraction';

export function checkStoreFraction(
  item: {
    storeFilter: FieldStoreFilter;
    storeResult: string;
    storeFractionTypes: FileStoreFractionType[];
    fractions: FileFraction[];
    fractionsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let errorsOnStart = item.errors.length;

  item.fractions.forEach(fraction => {
    let fractionLineNums: number[] = Object.keys(fraction)
      .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
      .map(y => fraction[y as keyof FileFraction] as number);

    if (isDefined(fraction) && fraction.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: 'FRACTIONS_ELEMENT_IS_NOT_A_DICTIONARY',
          message: `found at least one fractions element that is not a dictionary`,
          lines: [
            {
              line: item.fractionsLineNum,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    Object.keys(fraction)
      .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          (['logic', 'type', 'controls'] satisfies FileParameter[]).findIndex(
            candidate => candidate === parameter
          ) < 0
        ) {
          item.errors.push(
            new BmError({
              title: 'UNKNOWN_FRACTIONS_ELEMENT_PARAMETER',
              message: `parameter "${parameter}" cannot be used in ${'fractions' satisfies FileParameter} element`,
              lines: [
                {
                  line: fraction[
                    (parameter + LINE_NUM) as keyof FileFraction
                  ] as number,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );
          return;
        }

        if (
          Array.isArray(fraction[parameter as keyof FileFraction]) &&
          parameter !== ('controls' satisfies FileParameter)
        ) {
          item.errors.push(
            new BmError({
              title: 'UNEXPECTED_LIST',
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: fraction[
                    (parameter + LINE_NUM) as keyof FileFraction
                  ] as number,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );
          return;
        }

        if (fraction[parameter as keyof FileFraction]?.constructor === Object) {
          item.errors.push(
            new BmError({
              title: 'UNEXPECTED_DICTIONARY',
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: fraction[
                    (parameter + LINE_NUM) as keyof FileFraction
                  ] as number,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );
          return;
        }
      });

    if (isDefined(item.storeResult) && isUndefined(fraction.logic)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_MISSING_LOGIC',
          message: `parameter "${'logic' satisfies FileParameter}" must be specified`,
          lines: [
            {
              line: Math.min(...fractionLineNums),
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(item.storeFilter) && isDefined(fraction.logic)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CANNOT_USE_LOGIC_PARAMETER_WITH_STORE_FILTER',
          message: `parameter "${'logic' satisfies FileParameter}" cannot be used with store filter`,
          lines: [
            {
              line: fraction.logic_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(item.storeFilter) && isDefined(fraction.type)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CANNOT_USE_TYPE_PARAMETER_WITH_STORE_FILTER',
          message: `parameter "${'type' satisfies FileParameter}" cannot be used with store filter`,
          lines: [
            {
              line: fraction.type_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      isDefined(fraction.logic) &&
      fractionLogicValues.indexOf(fraction.logic) < 0
    ) {
      item.errors.push(
        new BmError({
          title: 'WRONG_LOGIC',
          message: `${'logic' satisfies FileParameter} value must be "OR" or "AND_NOT"`,
          lines: [
            {
              line: fraction.logic_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(item.storeResult) && isUndefined(fraction.type)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_MISSING_TYPE',
          message: `parameter "${'type' satisfies FileParameter}" must be specified`,
          lines: [
            {
              line: Math.min(...fractionLineNums),
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(item.storeResult) && isUndefined(fraction.type)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_MISSING_TYPE',
          message: `parameter "${'type' satisfies FileParameter}" must be specified`,
          lines: [
            {
              line: Math.min(...fractionLineNums),
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isUndefined(fraction.controls)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_MISSING_CONTROLS',
          message: `parameter "${'controls' satisfies FileParameter}" is required`,
          lines: [
            {
              line: Math.min(...fractionLineNums),
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (isDefined(fraction.type)) {
      let storeFractionType = item.storeFractionTypes.find(
        ft => ft.type === fraction.type
      );

      if (isUndefined(storeFractionType)) {
        item.errors.push(
          new BmError({
            title: 'WRONG_TYPE',
            message: `${'type' satisfies FileParameter} references missing "${fraction.type}" of store result "${item.storeResult}"`,
            lines: [
              {
                line: fraction.type_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (fraction.controls.length !== storeFractionType.controls.length) {
        item.errors.push(
          new BmError({
            title: 'FRACTION_CONTROLS_LENGTH_DOES_NOT_MATCH_STORE_RESULT',
            message: `fraction controls length must be the same as store result controls length`,
            lines: [
              {
                line: fraction.controls_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }
    }

    if (
      isDefined(item.storeFilter) &&
      fraction.controls.length !== item.storeFilter.fraction_controls.length
    ) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CONTROLS_LENGTH_DOES_NOT_MATCH_STORE_FILTER',
          message: `fraction controls length must be the same as store filter fraction_controls length`,
          lines: [
            {
              line: fraction.controls_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }
  });

  return item.errors;
}
