import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.MakeFieldsDoubleDepsAfterSingles;

export function makeFieldsDoubleDepsAfterSingles(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

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

          if (depField.fieldClass === apiToBlockml.FieldClassEnum.Calculation) {
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
        f.fieldClass === apiToBlockml.FieldClassEnum.Measure &&
        [
          apiToBlockml.FieldTypeEnum.SumByKey,
          apiToBlockml.FieldTypeEnum.AverageByKey,
          apiToBlockml.FieldTypeEnum.MedianByKey,
          apiToBlockml.FieldTypeEnum.PercentileByKey
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
