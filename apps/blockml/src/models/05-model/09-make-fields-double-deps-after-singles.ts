import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.MakeFieldsDoubleDepsAfterSingles;

export function makeFieldsDoubleDepsAfterSingles(
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

  item.models.forEach(x => {
    x.fieldsDoubleDepsAfterSingles = {};

    x.fields.forEach(f => {
      x.fieldsDoubleDepsAfterSingles[f.name] = {};

      // work with sqlReal
      let restart = true;

      while (restart) {
        restart = false;

        let r;
        let reg = common.MyRegex.CAPTURE_DOUBLE_REF_G(); // g works because of restart

        while ((r = reg.exec(f.sqlReal))) {
          let asName: string = r[1];
          let depName: string = r[2];

          let depJoin = x.joins.find(j => j.as === asName);
          let depField = depJoin.view.fields.find(
            field => field.name === depName
          );

          if (depField.fieldClass === common.FieldClassEnum.Calculation) {
            f.sqlReal = common.MyRegex.replaceAndConvert(
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
              common.isUndefined(x.fieldsDoubleDepsAfterSingles[f.name][asName])
            ) {
              x.fieldsDoubleDepsAfterSingles[f.name][asName] = {};
            }

            x.fieldsDoubleDepsAfterSingles[f.name][asName][depName] =
              f.sql_line_num;
          }
        }
      }

      // work with sqlKeyReal
      if (
        f.fieldClass === common.FieldClassEnum.Measure &&
        [
          common.FieldTypeEnum.SumByKey,
          common.FieldTypeEnum.AverageByKey,
          common.FieldTypeEnum.MedianByKey,
          common.FieldTypeEnum.PercentileByKey
        ].indexOf(f.type) > -1
      ) {
        let r2;
        let reg2 = common.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r2 = reg2.exec(f.sqlKeyReal))) {
          let asName2: string = r2[1];
          let depName2: string = r2[2];

          if (
            common.isUndefined(x.fieldsDoubleDepsAfterSingles[f.name][asName2])
          ) {
            x.fieldsDoubleDepsAfterSingles[f.name][asName2] = {};
          }

          x.fieldsDoubleDepsAfterSingles[f.name][asName2][depName2] =
            f.sql_key_line_num;
        }
      }
    });
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Models,
    item.models
  );

  return item.models;
}
