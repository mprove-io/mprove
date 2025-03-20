import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileFraction } from '~common/_index';

let func = common.FuncEnum.CheckStoreFractionControls;

export function checkStoreFraction(
  item: {
    storeFilter: common.FieldStoreFilter;
    storeResult: string;
    storeFractionTypes: common.FileStoreFractionType[];
    fractions: common.FileFraction[];
    fractionsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let errorsOnStart = item.errors.length;

  item.fractions.forEach(fraction => {
    if (common.isDefined(fraction) && fraction.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FRACTIONS_ELEMENT_IS_NOT_A_DICTIONARY,
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
      .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
      .forEach(parameter => {
        if (
          [
            common.ParameterEnum.Logic.toString(),
            common.ParameterEnum.Type.toString(),
            common.ParameterEnum.Controls.toString()
          ].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNKNOWN_FRACTIONS_ELEMENT_PARAMETER,
              message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.Fractions} element`,
              lines: [
                {
                  line: fraction[
                    (parameter + constants.LINE_NUM) as keyof FileFraction
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
          [common.ParameterEnum.Controls.toString()].indexOf(parameter) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.UNEXPECTED_LIST,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: fraction[
                    (parameter + constants.LINE_NUM) as keyof FileFraction
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
              title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
              message: `parameter "${parameter}" must have a single value`,
              lines: [
                {
                  line: fraction[
                    (parameter + constants.LINE_NUM) as keyof FileFraction
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
          common.isDefined(item.storeResult) &&
          common.isUndefined(fraction.logic)
        ) {
          let fractionLineNums: number[] = Object.keys(fraction)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => fraction[y as keyof FileFraction] as number);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.FRACTION_MISSING_LOGIC,
              message: `parameter "${common.ParameterEnum.Logic}" must be specified`,
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

        if (
          common.isDefined(item.storeFilter) &&
          common.isDefined(fraction.logic)
        ) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .FRACTION_CAN_NOT_USE_LOGIC_PARAMETER_WITH_STORE_FILTER,
              message: `parameter "${common.ParameterEnum.Logic}" can not be used with store filter`,
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

        if (
          common.isDefined(fraction.logic) &&
          common.LOGIC_VALUES.map(v => v.toString()).indexOf(fraction.logic) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.FRACTION_WRONG_LOGIC,
              message: `${common.ParameterEnum.Logic} value must be "OR" or "AND_NOT"`,
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

        if (
          common.isDefined(item.storeResult) &&
          common.isUndefined(fraction.type)
        ) {
          let fractionLineNums: number[] = Object.keys(fraction)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => fraction[y as keyof FileFraction] as number);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.FRACTION_MISSING_TYPE,
              message: `parameter "${common.ParameterEnum.Type}" must be specified`,
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

        if (
          common.isDefined(item.storeFilter) &&
          common.isDefined(fraction.type)
        ) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .FRACTION_CAN_NOT_USE_TYPE_PARAMETER_WITH_STORE_FILTER,
              message: `parameter "${common.ParameterEnum.Type}" can not be used with store filter`,
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

        if (common.isDefined(fraction.type)) {
          let storeFractionType = item.storeFractionTypes.find(
            ft => ft.type === fraction.type
          );

          if (common.isUndefined(storeFractionType)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.FRACTION_WRONG_TYPE,
                message: `${common.ParameterEnum.Type} references missing "${fraction.type}" of store result "${item.storeResult}"`,
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
                  common.ErTitleEnum
                    .FRACTION_CONTROLS_LENGTH_DOES_NOT_MATCH_STORE_RESULT,
                message: `fraction controls length must be the same as store result controls length`,
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
        }

        if (
          common.isDefined(item.storeFilter) &&
          common.isDefined(
            fraction.controls.length !==
              item.storeFilter.fraction_controls.length
          )
        ) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .FRACTION_CONTROLS_LENGTH_DOES_NOT_MATCH_STORE_FILTER,
              message: `fraction controls length must be the same as store filter fraction_controls length`,
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
      });
  });

  return item.errors;
}
