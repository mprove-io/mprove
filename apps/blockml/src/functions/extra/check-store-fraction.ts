import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { LOGIC_VALUES } from '~common/constants/top';
import { LINE_NUM } from '~common/constants/top-blockml';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FieldStoreFilter } from '~common/interfaces/blockml/internal/field-store-filter';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { FileStoreFractionType } from '~common/interfaces/blockml/internal/file-store-fraction-type';
import { MyRegex } from '~common/models/my-regex';
import { log } from './log';

let func = FuncEnum.CheckStoreFraction;

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
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  item.fractions.forEach(fraction => {
    let fractionLineNums: number[] = Object.keys(fraction)
      .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
      .map(y => fraction[y as keyof FileFraction] as number);

    if (isDefined(fraction) && fraction.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FRACTIONS_ELEMENT_IS_NOT_A_DICTIONARY,
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
          [
            ParameterEnum.Logic.toString(),
            ParameterEnum.Type.toString(),
            ParameterEnum.Controls.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNKNOWN_FRACTIONS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" cannot be used in ${ParameterEnum.Fractions} element`,
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
          [ParameterEnum.Controls.toString()].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.UNEXPECTED_LIST,
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
              title: ErTitleEnum.UNEXPECTED_DICTIONARY,
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
          title: ErTitleEnum.FRACTION_MISSING_LOGIC,
          message: `parameter "${ParameterEnum.Logic}" must be specified`,
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
          title:
            ErTitleEnum.FRACTION_CANNOT_USE_LOGIC_PARAMETER_WITH_STORE_FILTER,
          message: `parameter "${ParameterEnum.Logic}" cannot be used with store filter`,
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
          title:
            ErTitleEnum.FRACTION_CANNOT_USE_TYPE_PARAMETER_WITH_STORE_FILTER,
          message: `parameter "${ParameterEnum.Type}" cannot be used with store filter`,
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
      LOGIC_VALUES.map(v => v.toString()).indexOf(fraction.logic) < 0
    ) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FRACTION_WRONG_LOGIC,
          message: `${ParameterEnum.Logic} value must be "OR" or "AND_NOT"`,
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
          title: ErTitleEnum.FRACTION_MISSING_TYPE,
          message: `parameter "${ParameterEnum.Type}" must be specified`,
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
          title: ErTitleEnum.FRACTION_MISSING_TYPE,
          message: `parameter "${ParameterEnum.Type}" must be specified`,
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
          title: ErTitleEnum.FRACTION_MISSING_CONTROLS,
          message: `parameter "${ParameterEnum.Controls}" is required`,
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
            title: ErTitleEnum.FRACTION_WRONG_TYPE,
            message: `${ParameterEnum.Type} references missing "${fraction.type}" of store result "${item.storeResult}"`,
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
            title:
              ErTitleEnum.FRACTION_CONTROLS_LENGTH_DOES_NOT_MATCH_STORE_RESULT,
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
          title:
            ErTitleEnum.FRACTION_CONTROLS_LENGTH_DOES_NOT_MATCH_STORE_FILTER,
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
