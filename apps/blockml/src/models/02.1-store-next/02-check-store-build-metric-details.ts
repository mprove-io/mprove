import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreDetail } from '~common/_index';

let func = common.FuncEnum.CheckStoreBuildMetricDetails;

export function checkStoreBuildMetricDetails(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.build_metrics.forEach(buildMetric => {
      let detailDeclarations: { unit: string; unitLineNums: number[] }[] = [];

      buildMetric.details.forEach(detail => {
        if (common.isDefined(detail) && detail.constructor !== Object) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.DETAIL_IS_NOT_A_DICTIONARY,
              message: `found at least one ${common.ParameterEnum.Details} element that is not a dictionary`,
              lines: [
                {
                  line: buildMetric.details_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        Object.keys(detail)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if (
              [
                common.ParameterEnum.Unit.toString(),
                common.ParameterEnum.Dimension.toString()
              ].indexOf(parameter) < 0
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNKNOWN_DETAIL_PARAMETER,
                  message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.Details} element`,
                  lines: [
                    {
                      line: detail[
                        (parameter +
                          constants.LINE_NUM) as keyof FileStoreDetail
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            if (Array.isArray(detail[parameter as keyof FileStoreDetail])) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNEXPECTED_LIST,
                  message: `parameter "${parameter}" must have a single value`,
                  lines: [
                    {
                      line: detail[
                        (parameter +
                          constants.LINE_NUM) as keyof FileStoreDetail
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
              detail[parameter as keyof FileStoreDetail]?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
                  message: `parameter "${parameter}" must not be a dictionary`,
                  lines: [
                    {
                      line: detail[
                        (parameter +
                          constants.LINE_NUM) as keyof FileStoreDetail
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          });

        if (errorsOnStart === item.errors.length) {
          if (common.isUndefined(detail.unit)) {
            let detailKeysLineNums: number[] = Object.keys(detail)
              .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
              .map(y => detail[y as keyof FileStoreDetail] as number);

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_DETAIL_UNIT,
                message: `detail must have "${common.ParameterEnum.Unit}" parameter`,
                lines: [
                  {
                    line: Math.min(...detailKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (common.isUndefined(detail.dimension)) {
            let detailKeysLineNums: number[] = Object.keys(detail)
              .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
              .map(y => detail[y as keyof FileStoreDetail] as number);

            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MISSING_DETAIL_DIMENSION,
                message: `detail must have "${common.ParameterEnum.Dimension}" parameter`,
                lines: [
                  {
                    line: Math.min(...detailKeysLineNums),
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            common.DETAIL_UNIT_VALUES.map(v => v.toString()).indexOf(
              detail.unit
            ) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.WRONG_DETAIL_UNIT,
                message: `${common.ParameterEnum.Unit} value must be "years", "quarters", "months", "weeksSunday", "weeksMonday", "days", "hours" or "minutes"`,
                lines: [
                  {
                    line: detail.unit_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }

        if (errorsOnStart === item.errors.length) {
          let index = detailDeclarations.findIndex(d => d.unit === detail.unit);

          if (index > -1) {
            detailDeclarations[index].unitLineNums.push(detail.unit_line_num);
          } else {
            detailDeclarations.push({
              unit: detail.unit,
              unitLineNums: [detail.unit_line_num]
            });
          }
        }
      });

      if (errorsOnStart === item.errors.length) {
        detailDeclarations.forEach(d => {
          if (d.unitLineNums.length > 1) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.DUPLICATE_DETAIL,
                message: `"${common.ParameterEnum.Unit}" value must be unique across details elements`,
                lines: d.unitLineNums.map(l => ({
                  line: l,
                  name: x.fileName,
                  path: x.filePath
                }))
              })
            );
            return;
          }
        });
      }
    });

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
