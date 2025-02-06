import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { FileStoreBuildMetric } from '~common/_index';

let func = common.FuncEnum.CheckStoreBuildMetrics;

export function checkStoreBuildMetrics(
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

    if (common.isUndefined(x.build_metrics)) {
      x.build_metrics = [];
    }

    // let groups: { groupName: string; groupLineNums: number[] }[] = [];

    x.build_metrics.forEach(buildMetric => {
      if (common.isDefined(buildMetric) && buildMetric.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.BUILD_METRICS_ELEMENT_IS_NOT_A_DICTIONARY,
            message: `found at least one ${common.ParameterEnum.BuildMetrics} element that is not a dictionary`,
            lines: [
              {
                line: x.build_metrics_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      Object.keys(buildMetric)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            [
              common.ParameterEnum.TimeLabel.toString(),
              common.ParameterEnum.Details.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_BUILD_METRIC_PARAMETER,
                message: `parameter "${parameter}" can not be used in build_metrics element`,
                lines: [
                  {
                    line: buildMetric[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreBuildMetric
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
            Array.isArray(
              buildMetric[parameter as keyof FileStoreBuildMetric] &&
                [common.ParameterEnum.Details.toString()].indexOf(parameter) < 0
            )
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: buildMetric[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreBuildMetric
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
            buildMetric[parameter as keyof FileStoreBuildMetric]
              ?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must not be a dictionary`,
                lines: [
                  {
                    line: buildMetric[
                      (parameter +
                        constants.LINE_NUM) as keyof FileStoreBuildMetric
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
        if (common.isUndefined(buildMetric.time_label)) {
          let fieldKeysLineNums: number[] = Object.keys(buildMetric)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => buildMetric[y as keyof FileStoreBuildMetric] as number);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_TIME_LABEL,
              message: `field group must have "${common.ParameterEnum.TimeLabel}" parameter`,
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

        if (common.isUndefined(buildMetric.details)) {
          let fieldKeysLineNums: number[] = Object.keys(buildMetric)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => buildMetric[y as keyof FileStoreBuildMetric] as number);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_DETAILS,
              message: `field group must have "${common.ParameterEnum.Details}" parameter`,
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

        // let index = groups.findIndex(
        //   group => group.groupName === buildMetric.group
        // );

        // if (index > -1) {
        //   groups[index].groupLineNums.push(buildMetric.group_line_num);
        // } else {
        //   groups.push({
        //     groupName: buildMetric.group,
        //     groupLineNums: [buildMetric.group_line_num]
        //   });
        // }
      }
    });

    // if (errorsOnStart === item.errors.length) {
    //   groups.forEach(group => {
    //     if (group.groupLineNums.length > 1) {
    //       item.errors.push(
    //         new BmError({
    //           title: common.ErTitleEnum.DUPLICATE_GROUPS,
    //           message: `"${common.ParameterEnum.Group}" value must be unique across field_groups elements`,
    //           lines: group.groupLineNums.map(l => ({
    //             line: l,
    //             name: x.fileName,
    //             path: x.filePath
    //           }))
    //         })
    //       );
    //       return;
    //     }

    //     //

    //     let groupWrongChars: string[] = [];

    //     let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_GROUP_CHARS_G();
    //     let r2;

    //     while ((r2 = reg2.exec(group.groupName))) {
    //       groupWrongChars.push(r2[1]);
    //     }

    //     let groupWrongCharsString = '';

    //     if (groupWrongChars.length > 0) {
    //       groupWrongCharsString = [...new Set(groupWrongChars)].join(', '); // unique

    //       item.errors.push(
    //         new BmError({
    //           title: common.ErTitleEnum.WRONG_CHARS_IN_GROUP,
    //           message: `Characters "${groupWrongCharsString}" can not be used for group (only snake_case "a...z0...9_" is allowed)`,
    //           lines: [
    //             {
    //               line: group.groupLineNums[0],
    //               name: x.fileName,
    //               path: x.filePath
    //             }
    //           ]
    //         })
    //       );
    //       return false;
    //     }
    //   });
    // }

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
