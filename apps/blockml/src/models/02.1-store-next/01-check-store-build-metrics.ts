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

    let timeNames: { timeName: string; timeNameLineNums: number[] }[] = [];

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
          if ([common.ParameterEnum.Time.toString()].indexOf(parameter) < 0) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.UNKNOWN_BUILD_METRIC_PARAMETER,
                message: `parameter "${parameter}" can not be used in ${common.ParameterEnum.BuildMetrics} element`,
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
            Array.isArray(buildMetric[parameter as keyof FileStoreBuildMetric])
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
        if (common.isUndefined(buildMetric.time)) {
          let buildMetricKeysLineNums: number[] = Object.keys(buildMetric)
            .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => buildMetric[y as keyof FileStoreBuildMetric] as number)
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MISSING_TIME,
              message: `${common.ParameterEnum.BuildMetrics} element must have "${common.ParameterEnum.Time}" parameter`,
              lines: [
                {
                  line: Math.min(...buildMetricKeysLineNums),
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        // if (common.isUndefined(buildMetric.label)) {
        //   buildMetric.label = common.MyRegex.replaceUnderscoresWithSpaces(
        //     buildMetric.time
        //   );
        //   buildMetric.label = buildMetric.label
        //     .split(' ')
        //     .map(word => common.capitalizeFirstLetter(word))
        //     .join(' ');

        //   buildMetric.label_line_num = 0;
        // }

        let index = timeNames.findIndex(tn => tn.timeName === buildMetric.time);

        if (index > -1) {
          timeNames[index].timeNameLineNums.push(buildMetric.time_line_num);
        } else {
          timeNames.push({
            timeName: buildMetric.time,
            timeNameLineNums: [buildMetric.time_line_num]
          });
        }

        if (
          x.field_time_groups.map(el => el.time).indexOf(buildMetric.time) < 0
        ) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_TIME,
              message: `specified ${common.ParameterEnum.Time} "${buildMetric.time}" is not found in ${common.ParameterEnum.FieldTimeGroups}`,
              lines: [
                {
                  line: buildMetric.time_line_num,
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
      timeNames.forEach(timeName => {
        if (timeName.timeNameLineNums.length > 1) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.DUPLICATE_TIME_NAMES,
              message: `"${common.ParameterEnum.Time}" value must be unique across ${common.ParameterEnum.BuildMetrics} elements`,
              lines: timeName.timeNameLineNums.map(l => ({
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
