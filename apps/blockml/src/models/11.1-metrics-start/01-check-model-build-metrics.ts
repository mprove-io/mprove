import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckModelBuildMetrics;

export function checkModelBuildMetrics(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
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
                    `parameter "${parameter}" cannot be used ` +
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

            let timeFieldRef = bm[common.TimeframeEnum.Time];

            let reg =
              common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(timeFieldRef);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title: common.ErTitleEnum.WRONG_TIME_FIELD,
                  message:
                    `Time field "${timeFieldRef}" is not valid.` +
                    'Reference must be in form "alias.field_name"',
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

            let asName = r[1];
            let fieldName = r[2];
            let asFieldNameRef = `${asName}.${fieldName}`;

            if (asName === common.MF) {
              let modelField = x.fields.find(
                mField =>
                  mField.groupId === fieldName &&
                  mField.name ===
                    `${fieldName}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`
              );

              if (common.isUndefined(modelField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_TIME_MODEL_FIELD,
                    message: `found "${asFieldNameRef}" which does not refer to a time field`,
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
            } else {
              let join = x.joins.find(j => j.as === asName);
              if (common.isUndefined(join)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_TIME_ALIAS,
                    message:
                      `found "${asFieldNameRef}" references missing alias ` +
                      `"${asName}" in joins section of model "${x.name}"`,
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

              let viewField = join.view.fields.find(
                vField =>
                  vField.groupId === fieldName &&
                  vField.name ===
                    `${fieldName}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`
              );

              if (common.isUndefined(viewField)) {
                item.errors.push(
                  new BmError({
                    title: common.ErTitleEnum.WRONG_TIME_VIEW_FIELD,
                    message: `found "${asFieldNameRef}" which does not refer to a time field`,
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
            }
          })
      );
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
