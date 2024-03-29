import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckDefaultFilters;

export function checkDefaultFilters<T extends types.dzType>(
  item: {
    entities: T[];
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      if (common.isUndefined(report.default_filters)) {
        report.default_filters = {};
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.default_filters)
        .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
        .forEach(defaultFilter => {
          let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
          let r = reg.exec(defaultFilter);

          if (common.isUndefined(r)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DEFAULT_FILTER_WRONG_REFERENCE,
                message: 'default filter must be in form "alias.field_name"',
                lines: [
                  {
                    line: (<any>report.default_filters)[
                      defaultFilter + constants.LINE_NUM
                    ],
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

          if (asName === constants.MF) {
            let modelField = model.fields.find(
              mField => mField.name === fieldName
            );

            if (common.isUndefined(modelField)) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
                      .REPORT_DEFAULT_FILTER_REFS_MISSING_MODEL_FIELD,
                  message:
                    `"${defaultFilter}" references missing or not valid field ` +
                    `"${fieldName}" of model "${model.name}" fields section`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          } else {
            let join = model.joins.find(j => j.as === asName);

            if (common.isUndefined(join)) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum.REPORT_DEFAULT_FILTER_REFS_MISSING_ALIAS,
                  message:
                    `"${defaultFilter}" references missing alias ` +
                    `"${asName}" of model "${model.name}" joins section`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }

            let viewField = join.view.fields.find(
              vField => vField.name === fieldName
            );

            if (common.isUndefined(viewField)) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
                      .REPORT_DEFAULT_FILTER_REFS_MISSING_VIEW_FIELD,
                  message:
                    `"${defaultFilter}" references missing or not valid field ` +
                    `"${fieldName}" of view "${join.view.name}". ` +
                    `View has "${asName}" alias in "${model.name}" model.`,
                  lines: [
                    {
                      line: (<any>report.default_filters)[
                        defaultFilter + constants.LINE_NUM
                      ],
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          }

          if (common.isDefined(report.listen[defaultFilter])) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .REPORT_SAME_FIELD_IN_DEFAULT_AND_LISTEN_FILTERS,
                message:
                  `found "${defaultFilter}" in default and listen filters ` +
                  'at the same time',
                lines: [
                  {
                    line: (<any>report.default_filters)[
                      defaultFilter + constants.LINE_NUM
                    ],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (!Array.isArray(report.default_filters[defaultFilter])) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_DEFAULT_FILTER_MUST_BE_A_LIST,
                message:
                  `default filter ${defaultFilter} must be a list of ` +
                  'filter expressions',
                lines: [
                  {
                    line: (<any>report.default_filters)[
                      defaultFilter + constants.LINE_NUM
                    ],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          let result =
            asName === constants.MF
              ? model.fields.find(mField => mField.name === fieldName).result
              : model.joins
                  .find(j => j.as === asName)
                  .view.fields.find(vField => vField.name === fieldName).result;

          let p = barSpecial.processFilter({
            filterBricks: report.default_filters[defaultFilter],
            result: result
          });

          if (p.valid === 0) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .REPORT_DEFAULT_FILTER_WRONG_FILTER_EXPRESSION,
                message:
                  `wrong expression "${p.brick}" of filter "${defaultFilter}" ` +
                  `for ${enums.ParameterEnum.Result} "${result}" `,
                lines: [
                  {
                    line: (<any>report.default_filters)[
                      defaultFilter + constants.LINE_NUM
                    ],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
