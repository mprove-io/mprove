import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { types } from '../../barrels/types';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.SubstituteSingleRefs;

export function substituteSingleRefs<T extends types.vmType>(item: {
  errors: BmError[];
  entities: Array<T>;
  structId: string;
  caller: enums.CallerEnum;
}): Array<T> {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.entities.forEach(x => {
    if (x.fileExt === api.FileExtensionEnum.Dashboard) {
      return;
    }

    x.fieldsDepsAfterSingles = {};

    x.fields.forEach(field => {
      x.fieldsDepsAfterSingles[field.name] = {};

      switch (true) {
        // process dimensions (they can reference only dimensions - already checked)
        case field.fieldClass === api.FieldClassEnum.Dimension: {
          let dimension: interfaces.Dimension = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let reg = api.MyRegex.CAPTURE_SINGLE_REF();
          let r;

          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];
            let referenceField = x.fields.find(f => f.name === reference);

            sqlReal = api.MyRegex.replaceSingleRefs(
              sqlReal,
              reference,
              referenceField.sql
            );
          }

          dimension.sqlReal = sqlReal;

          // sqlTimestampReal
          if (dimension.result === api.FieldResultEnum.Ts) {
            let sqlTimestampReal = dimension.sqlTimestamp; // init

            let reg2 = api.MyRegex.CAPTURE_SINGLE_REF();
            let r2;

            while ((r2 = reg2.exec(sqlTimestampReal))) {
              let reference2 = r2[1];
              let referenceField2 = x.fields.find(f => f.name === reference2);

              sqlTimestampReal = api.MyRegex.replaceSingleRefs(
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
        case field.fieldClass === api.FieldClassEnum.Measure &&
          x.fileExt === api.FileExtensionEnum.Model: {
          let measure: interfaces.Measure = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let reg = api.MyRegex.CAPTURE_SINGLE_REF();
          let r;

          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];
            let referenceField = x.fields.find(f => f.name === reference);

            sqlReal = api.MyRegex.replaceSingleRefs(
              sqlReal,
              reference,
              referenceField.sql
            );
          }

          measure.sqlReal = sqlReal;

          // sqlKeyReal
          if (
            [
              api.FieldTypeEnum.SumByKey,
              api.FieldTypeEnum.AverageByKey,
              api.FieldTypeEnum.MedianByKey,
              api.FieldTypeEnum.PercentileByKey
            ].indexOf(measure.type) > -1
          ) {
            let sqlKeyReal = measure.sql_key; // init

            let reg2 = api.MyRegex.CAPTURE_SINGLE_REF();
            let r2;

            while ((r2 = reg2.exec(sqlKeyReal))) {
              let reference2 = r2[1];
              let referenceField2 = x.fields.find(f => f.name === reference2);

              sqlKeyReal = api.MyRegex.replaceSingleRefs(
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
        case field.fieldClass === api.FieldClassEnum.Measure &&
          x.fileExt === api.FileExtensionEnum.View: {
          let measure: interfaces.Measure = field;

          // sqlReal
          let sqlReal = field.sql; // init

          let reg = api.MyRegex.CAPTURE_SINGLE_REF_G();
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
              api.FieldTypeEnum.SumByKey,
              api.FieldTypeEnum.AverageByKey,
              api.FieldTypeEnum.MedianByKey,
              api.FieldTypeEnum.PercentileByKey
            ].indexOf(measure.type) > -1
          ) {
            let sqlKeyReal = measure.sql_key; // init

            let reg2 = api.MyRegex.CAPTURE_SINGLE_REF_G();
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
        case field.fieldClass === api.FieldClassEnum.Calculation: {
          let calculation: interfaces.Calculation = field;

          // calculation.prepForceDims initialized inside while

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

            calculation.prepForceDims = {}; // needs to be reinitialized after each restart
            deps = []; // needs to be reinitialized after each restart

            let reg = api.MyRegex.CAPTURE_SINGLE_REF_G(); // g works because of restart
            let r;

            while ((r = reg.exec(sqlReal))) {
              let reference = r[1];

              let referenceField = x.fields.find(f => f.name === reference);

              switch (true) {
                case referenceField.fieldClass ===
                  api.FieldClassEnum.Calculation: {
                  sqlReal = api.MyRegex.replaceSingleRefs(
                    sqlReal,
                    reference,
                    referenceField.sql
                  );

                  restart = true;
                  break;
                }

                case referenceField.fieldClass ===
                  api.FieldClassEnum.Dimension: {
                  deps.push({
                    depName: reference,
                    depLineNum: calculation.sql_line_num
                  });

                  calculation.prepForceDims[reference] =
                    calculation.sql_line_num;
                  break;
                }

                case referenceField.fieldClass === api.FieldClassEnum.Measure: {
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

        // process filters
        // case field.fieldClass === api.FieldClassEnum.Filter: {
        //   let filter: interfaces.Filter = field;
        //   // sqlReal
        //   let sqlReal = field.sql; // init
        //   filterField.prepForceDims = {};
        //   filterField.sqlReal = sqlReal;
        //   break;
        // }
      }
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, item.entities);

  return item.entities;
}
