import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.MakeFieldsDoubleDepsAfterSingles;

export function makeFieldsDoubleDepsAfterSingles(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.fieldsDoubleDepsAfterSingles = {};

    x.fields.forEach(f => {
      x.fieldsDoubleDepsAfterSingles[f.name] = {};

      // work with sqlReal
      let restart = true;

      while (restart) {
        restart = false;

        let r;
        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G(); // g works because of restart

        while ((r = reg.exec(f.sqlReal))) {
          let asName: string = r[1];
          let depName: string = r[2];

          let depJoin = x.joins.find(j => j.as === asName);
          let depField = depJoin.view.fields.find(
            field => field.name === depName
          );

          if (depField.fieldClass === enums.FieldClassEnum.Calculation) {
            f.sqlReal = api.MyRegex.replaceAndConvert(
              f.sqlReal,
              depField.sqlReal,
              asName,
              depName
            );

            restart = true;
            break;
          } else {
            // ok
            if (
              helper.isUndefined(x.fieldsDoubleDepsAfterSingles[f.name][asName])
            ) {
              x.fieldsDoubleDepsAfterSingles[f.name][asName] = {};
            }

            x.fieldsDoubleDepsAfterSingles[f.name][asName][depName] =
              f.sql_line_num;

            if (
              f.fieldClass === enums.FieldClassEnum.Calculation &&
              depField.fieldClass === enums.FieldClassEnum.Dimension
            ) {
              if (helper.isUndefined(f.forceDims[asName])) {
                f.forceDims[asName] = {};
              }

              f.forceDims[asName][depName] = f.sql_line_num;
            }
          }
        }
      }

      // work with sqlKeyReal
      if (
        f.fieldClass === enums.FieldClassEnum.Measure &&
        [
          enums.FieldAnyTypeEnum.SumByKey,
          enums.FieldAnyTypeEnum.AverageByKey,
          enums.FieldAnyTypeEnum.MedianByKey,
          enums.FieldAnyTypeEnum.PercentileByKey
        ].indexOf(f.type) > -1
      ) {
        let r2;
        let reg2 = api.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r2 = reg2.exec(f.sqlKeyReal))) {
          let asName2: string = r2[1];
          let depName2: string = r2[2];

          if (
            helper.isUndefined(x.fieldsDoubleDepsAfterSingles[f.name][asName2])
          ) {
            x.fieldsDoubleDepsAfterSingles[f.name][asName2] = {};
          }

          x.fieldsDoubleDepsAfterSingles[f.name][asName2][depName2] =
            f.sql_key_line_num;
        }
      }
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
