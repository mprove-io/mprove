import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckFiltersForceDims;

export function checkFiltersForceDims(item: {
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
      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.combinedFilters).forEach(element => {
        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
        let r = reg.exec(element);

        // r checked

        let asName = r[1];
        let fieldName = r[2];

        let field: interfaces.FieldAny;

        if (asName === constants.MF) {
          field = model.fields.find(mField => mField.name === fieldName);
        } else {
          let join = model.joins.find(j => j.as === asName);
          field = join.view.fields.find(vField => vField.name === fieldName);
        }

        if (field.fieldClass !== enums.FieldClassEnum.Calculation) {
          return;
        }

        Object.keys(field.forceDims).forEach(alias => {
          Object.keys(field.forceDims[alias]).forEach(dim => {
            let fDim = `${alias}.${dim}`;

            if (helper.isUndefined(report.selectHash[fDim])) {
              // // error e108
              // item.errors.push(
              //   new BmError({
              //     title: `calculation needs dimension`,
              //     message: `filtering calculation "${element}" needs dimension "${fDim}" in select`,
              //     lines: [
              //       {
              //         line: report.select_line_num,
              //         name: x.fileName,
              //         path: x.filePath
              //       }
              //     ]
              //   })
              // );
              // return;

              report.selectWithForceDims.push(fDim);
              report.selectHash[fDim] = {};
            }
          });
        });
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
