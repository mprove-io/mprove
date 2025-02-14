import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckViewBuildMetrics;

export function checkViewBuildMetrics(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newViews: common.FileView[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isDefined(x.build_metrics)) {
      x.build_metrics.forEach(bm =>
        Object.keys(bm)
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(parameter => {
            if ([common.ParameterEnum.Time.toString()].indexOf(parameter) < 0) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.BUILD_METRICS_UNKNOWN_PARAMETER,
                  message:
                    `parameter "${parameter}" can not be used ` +
                    `with "${common.ParameterEnum.BuildMetrics}"`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
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
              Array.isArray(bm[parameter as keyof common.FileBuildMetricsTime])
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TIME_UNEXPECTED_LIST,
                  message: `parameter '${parameter}' must have a single value`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
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
              bm[parameter as keyof common.FileBuildMetricsTime]
                ?.constructor === Object
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.TIME_UNEXPECTED_DICTIONARY,
                  message: `parameter '${parameter}' must have a single value`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            let timeFieldName = bm[common.TimeframeEnum.Time];

            if (
              timeFieldName.match(
                common.MyRegex.CAPTURE_NOT_SNAKE_CASE_CHARS_G()
              )
            ) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.WRONG_TIME_FIELD,
                  message:
                    `Time field "${timeFieldName}" is not valid. ` +
                    `Parameter "${parameter}" contains wrong characters or whitespace (only snake_case "a-z0-9_" is allowed). ` +
                    'Reference must be in form "field_name"',
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );

              return;
            }

            let timeField = x.fields.find(
              mField =>
                mField.groupId === timeFieldName &&
                mField.name ===
                  `${timeFieldName}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`
            );

            if (common.isUndefined(timeField)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.WRONG_TIME_MODEL_FIELD,
                  message: `found "${timeFieldName}" which does not refer to a time field`,
                  lines: [
                    {
                      line: (bm as any)[
                        parameter + constants.LINE_NUM
                      ] as number,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          })
      );
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, newViews);

  return newViews;
}
