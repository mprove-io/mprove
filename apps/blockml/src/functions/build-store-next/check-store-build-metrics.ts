import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import {
  FieldClassEnum,
  FileStoreBuildMetric,
  toBooleanFromLowercaseString
} from '~common/_index';

let func = FuncEnum.CheckStoreBuildMetrics;

export function checkStoreBuildMetrics(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.build_metrics)) {
      x.build_metrics = [];
    }

    if (
      x.build_metrics.length > 0 &&
      x.fields.filter(
        field =>
          field.fieldClass !== FieldClassEnum.Filter &&
          toBooleanFromLowercaseString(field.required) === true
      ).length > 0
    ) {
      item.errors.push(
        new BmError({
          title:
            ErTitleEnum.BUILD_METRICS_AND_REQUIRED_FIELDS_DO_NOT_WORK_TOGETHER,
          message: `${ParameterEnum.BuildMetrics} cannot be used in store when there are fields with "required" set to true`,
          lines: [
            {
              line: x.build_metrics_line_num,
              name: x.fileName,
              path: x.filePath
            },
            ...x.fields
              .filter(
                field => toBooleanFromLowercaseString(field.required) === true
              )
              .map(field => ({
                line: field.required_line_num,
                name: x.fileName,
                path: x.filePath
              }))
          ]
        })
      );
      return;
    }

    let timeNames: { timeName: string; timeNameLineNums: number[] }[] = [];

    x.build_metrics.forEach(buildMetric => {
      if (isDefined(buildMetric) && buildMetric.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: ErTitleEnum.BUILD_METRICS_ELEMENT_IS_NOT_A_DICTIONARY,
            message: `found at least one ${ParameterEnum.BuildMetrics} element that is not a dictionary`,
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
        .filter(k => !k.match(MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if ([ParameterEnum.Time.toString()].indexOf(parameter) < 0) {
            item.errors.push(
              new BmError({
                title: ErTitleEnum.UNKNOWN_BUILD_METRIC_PARAMETER,
                message: `parameter "${parameter}" cannot be used in ${ParameterEnum.BuildMetrics} element`,
                lines: [
                  {
                    line: buildMetric[
                      (parameter + LINE_NUM) as keyof FileStoreBuildMetric
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
                title: ErTitleEnum.UNEXPECTED_LIST,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: buildMetric[
                      (parameter + LINE_NUM) as keyof FileStoreBuildMetric
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
                title: ErTitleEnum.UNEXPECTED_DICTIONARY,
                message: `parameter "${parameter}" must not be a dictionary`,
                lines: [
                  {
                    line: buildMetric[
                      (parameter + LINE_NUM) as keyof FileStoreBuildMetric
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
        if (isUndefined(buildMetric.time)) {
          let buildMetricKeysLineNums: number[] = Object.keys(buildMetric)
            .filter(y => y.match(MyRegex.ENDS_WITH_LINE_NUM()))
            .map(y => buildMetric[y as keyof FileStoreBuildMetric] as number)
            .filter(ln => ln !== 0);

          item.errors.push(
            new BmError({
              title: ErTitleEnum.MISSING_TIME,
              message: `${ParameterEnum.BuildMetrics} element must have "${ParameterEnum.Time}" parameter`,
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

        // if (isUndefined(buildMetric.label)) {
        //   buildMetric.label = MyRegex.replaceUnderscoresWithSpaces(
        //     buildMetric.time
        //   );
        //   buildMetric.label = buildMetric.label
        //     .split(' ')
        //     .map(word => capitalizeFirstLetter(word))
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
              title: ErTitleEnum.WRONG_TIME,
              message: `specified ${ParameterEnum.Time} "${buildMetric.time}" is not found in ${ParameterEnum.FieldTimeGroups}`,
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
              title: ErTitleEnum.DUPLICATE_TIME_NAMES,
              message: `"${ParameterEnum.Time}" value must be unique across ${ParameterEnum.BuildMetrics} elements`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
