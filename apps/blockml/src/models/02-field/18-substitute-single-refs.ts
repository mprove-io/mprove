import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.SubstituteSingleRefs;

export function substituteSingleRefs<T extends types.vmType>(
  item: {
    errors: BmError[];
    entities: T[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): T[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.entities.forEach(x => {
    if (
      x.fileExt === common.FileExtensionEnum.Dashboard ||
      x.fileExt === common.FileExtensionEnum.Report
    ) {
      return;
    }

    x.fieldsDepsAfterSingles = {};

    x.fields.forEach(field => {
      x.fieldsDepsAfterSingles[field.name] = {};

      switch (true) {
        // process dimensions (they can reference only dimensions - already checked)
        case field.fieldClass === common.FieldClassEnum.Dimension: {
          let dimension: common.FieldDimension = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let reg = common.MyRegex.CAPTURE_SINGLE_REF();
          let r;

          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];
            let referenceField = x.fields.find(f => f.name === reference);

            sqlReal = common.MyRegex.replaceSingleRefs(
              sqlReal,
              reference,
              referenceField.sql
            );
          }

          dimension.sqlReal = sqlReal;

          // sqlTimestampReal
          if (dimension.result === common.FieldResultEnum.Ts) {
            let sqlTimestampReal = dimension.sqlTimestamp; // init

            let reg2 = common.MyRegex.CAPTURE_SINGLE_REF();
            let r2;

            while ((r2 = reg2.exec(sqlTimestampReal))) {
              let reference2 = r2[1];
              let referenceField2 = x.fields.find(f => f.name === reference2);

              sqlTimestampReal = common.MyRegex.replaceSingleRefs(
                sqlTimestampReal,
                reference2,
                referenceField2.sql
              );
            }

            dimension.sqlTimestampReal = sqlTimestampReal;
          }
          break;
        }

        // process measures of Models (they can reference only dimensions - already checked)
        case field.fieldClass === common.FieldClassEnum.Measure &&
          x.fileExt === common.FileExtensionEnum.Model: {
          let measure: common.FieldMeasure = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let reg = common.MyRegex.CAPTURE_SINGLE_REF();
          let r;

          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];
            let referenceField = x.fields.find(f => f.name === reference);

            sqlReal = common.MyRegex.replaceSingleRefs(
              sqlReal,
              reference,
              referenceField.sql
            );
          }

          measure.sqlReal = sqlReal;

          // sqlKeyReal
          if (
            [
              common.FieldTypeEnum.SumByKey,
              common.FieldTypeEnum.AverageByKey,
              common.FieldTypeEnum.MedianByKey,
              common.FieldTypeEnum.PercentileByKey
            ].indexOf(measure.type) > -1
          ) {
            let sqlKeyReal = measure.sql_key; // init

            let reg2 = common.MyRegex.CAPTURE_SINGLE_REF();
            let r2;

            while ((r2 = reg2.exec(sqlKeyReal))) {
              let reference2 = r2[1];
              let referenceField2 = x.fields.find(f => f.name === reference2);

              sqlKeyReal = common.MyRegex.replaceSingleRefs(
                sqlKeyReal,
                reference2,
                referenceField2.sql
              );
            }

            measure.sqlKeyReal = sqlKeyReal;
          }
          break;
        }

        // process measures of Views (they can reference only dimensions - already checked)
        case field.fieldClass === common.FieldClassEnum.Measure &&
          x.fileExt === common.FileExtensionEnum.View: {
          let measure: common.FieldMeasure = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let reg = common.MyRegex.CAPTURE_SINGLE_REF_G();
          let r;

          // can't replace here because we leave single references to dimensions untouched
          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];

            x.fieldsDepsAfterSingles[measure.name][reference] =
              measure.sql_line_num;
          }

          measure.sqlReal = measure.sql; // same as sqlReal

          // sqlKeyReal
          if (
            [
              common.FieldTypeEnum.SumByKey,
              common.FieldTypeEnum.AverageByKey,
              common.FieldTypeEnum.MedianByKey,
              common.FieldTypeEnum.PercentileByKey
            ].indexOf(measure.type) > -1
          ) {
            let sqlKeyReal = measure.sql_key; // init

            let reg2 = common.MyRegex.CAPTURE_SINGLE_REF_G();
            let r2;

            // can't replace here because we leave single references to dimensions untouched
            while ((r2 = reg2.exec(sqlKeyReal))) {
              let reference2 = r2[1];

              x.fieldsDepsAfterSingles[measure.name][reference2] =
                measure.sql_key_line_num;
            }

            measure.sqlKeyReal = measure.sql_key; // same as sqlKeyReal
          }
          break;
        }

        // process calculations (they can reference anything - already checked)
        case field.fieldClass === common.FieldClassEnum.Calculation: {
          let calculation: common.FieldCalculation = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let deps: {
            // declared here, initialized inside while
            depName: string;
            depLineNum: number; // line_num that referenced dep
          }[];

          let restart = true;

          while (restart) {
            restart = false;

            deps = []; // needs to be reinitialized after each restart

            let reg = common.MyRegex.CAPTURE_SINGLE_REF_G(); // g works because of restart
            let r;

            while ((r = reg.exec(sqlReal))) {
              let reference = r[1];

              let referenceField = x.fields.find(f => f.name === reference);

              switch (true) {
                case referenceField.fieldClass ===
                  common.FieldClassEnum.Calculation: {
                  sqlReal = common.MyRegex.replaceSingleRefs(
                    sqlReal,
                    reference,
                    referenceField.sql
                  );

                  restart = true;
                  break;
                }

                case referenceField.fieldClass ===
                  common.FieldClassEnum.Dimension: {
                  deps.push({
                    depName: reference,
                    depLineNum: calculation.sql_line_num
                  });
                  break;
                }

                case referenceField.fieldClass ===
                  common.FieldClassEnum.Measure: {
                  deps.push({
                    depName: reference,
                    depLineNum: calculation.sql_line_num
                  });
                  break;
                }
              }
            }
          }

          deps.forEach(dep => {
            x.fieldsDepsAfterSingles[calculation.name][dep.depName] =
              dep.depLineNum;
          });

          calculation.sqlReal = sqlReal;
          break;
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
    common.LogTypeEnum.Entities,
    item.entities
  );

  return item.entities;
}
