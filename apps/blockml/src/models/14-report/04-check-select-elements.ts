import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckSelectElements;

export function checkSelectElements<T extends types.dzType>(
  item: {
    entities: Array<T>;
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
      report.select.forEach(element => {
        let model = item.models.find(m => m.name === report.model);

        let reg = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
        let r = reg.exec(element);

        if (helper.isUndefined(r)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REPORT_WRONG_SELECT_ELEMENT,
              message: `found element "${element}" that can not be parsed as "alias.field_name"`,
              lines: [
                {
                  line: report.select_line_num,
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

          if (helper.isUndefined(modelField)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_WRONG_SELECT_MODEL_FIELD,
                message:
                  `found element "${element}" references missing or not valid field ` +
                  `"${fieldName}" of model "${model.name}" fields section`,
                lines: [
                  {
                    line: report.select_line_num,
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

          if (helper.isUndefined(join)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_WRONG_SELECT_ALIAS,
                message:
                  `found element "${element}" references missing alias ` +
                  `"${asName}" of model "${model.name}" joins section `,
                lines: [
                  {
                    line: report.select_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          let viewField = join.view.fields.find(f => f.name === fieldName);

          if (helper.isUndefined(viewField)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.REPORT_WRONG_SELECT_VIEW_FIELD,
                message:
                  `found element "${element}" references missing or not valid field ` +
                  `"${fieldName}" of view "${join.view.name}" fields section. ` +
                  `View has "${asName}" alias in "${model.name}" model.`,
                lines: [
                  {
                    line: report.select_line_num,
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
