import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckSelectElements;

export function checkSelectElements(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newDashboards: interfaces.Dashboard[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.reports.forEach(report => {
      report.selectHash = {};

      report.select.forEach(element => {
        let model = item.models.find(m => m.name === report.model);

        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
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

          if (helper.isUndefined(report.selectHash[element])) {
            report.selectHash[element] = {};
          }

          if (modelField.fieldClass === enums.FieldClassEnum.Calculation) {
            Object.keys(modelField.forceDims).forEach(alias => {
              Object.keys(modelField.forceDims[alias]).forEach(dim => {
                let forceDim = `${alias}.${dim}`;
                report.selectHash[element][forceDim] = 1;
              });
            });
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
            // error e89
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

          if (helper.isUndefined(report.selectHash[element])) {
            report.selectHash[element] = {};
          }

          if (viewField.fieldClass === enums.FieldClassEnum.Calculation) {
            Object.keys(viewField.forceDims).forEach(alias => {
              Object.keys(viewField.forceDims[alias]).forEach(dim => {
                let forceDim = `${alias}.${dim}`;
                report.selectHash[element][forceDim] = 1;
              });
            });
          }
        }
      });
    });

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
