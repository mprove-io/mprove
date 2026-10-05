import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM } from '#common/constants/top-blockml';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreBuildMetric } from '#common/types/blockml/parts/internal/file-store-build-metric';

let func: Func = 'build-store-next/check-store-build-metrics';

export function checkStoreBuildMetrics(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
          field.fieldClass !== 'filter' &&
          toBooleanFromLowercaseString(field.required) === true
      ).length > 0
    ) {
      item.errors.push(
        new BmError({
          title: 'BUILD_METRICS_AND_REQUIRED_FIELDS_DO_NOT_WORK_TOGETHER',
          message: `${'build_metrics' satisfies FileParameter} cannot be used in store when there are fields with "required" set to true`,
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
            title: 'BUILD_METRICS_ELEMENT_IS_NOT_A_DICTIONARY',
            message: `found at least one ${'build_metrics' satisfies FileParameter} element that is not a dictionary`,
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
          if (parameter !== ('time' satisfies FileParameter)) {
            item.errors.push(
              new BmError({
                title: 'UNKNOWN_BUILD_METRIC_PARAMETER',
                message: `parameter "${parameter}" cannot be used in ${'build_metrics' satisfies FileParameter} element`,
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
                title: 'UNEXPECTED_LIST',
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
                title: 'UNEXPECTED_DICTIONARY',
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
              title: 'MISSING_TIME',
              message: `${'build_metrics' satisfies FileParameter} element must have "${'time' satisfies FileParameter}" parameter`,
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
              title: 'WRONG_TIME',
              message: `specified ${'time' satisfies FileParameter} "${buildMetric.time}" is not found in ${'field_time_groups' satisfies FileParameter}`,
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
              title: 'DUPLICATE_TIME_NAMES',
              message: `"${'time' satisfies FileParameter}" value must be unique across ${'build_metrics' satisfies FileParameter} elements`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', newStores);

  return newStores;
}
