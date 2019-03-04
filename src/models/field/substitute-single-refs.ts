import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function substituteSingleRefs<
  T extends interfaces.View | interfaces.Model
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach(x => {
    x.fields_deps_after_singles = {};

    x.fields.forEach(field => {
      x.fields_deps_after_singles[field.name] = {};

      let sqlReal = field.sql; // init

      switch (true) {
        // process dimensions (they can reference only dimensions - already checked)
        case field.field_class === enums.FieldClassEnum.Dimension: {
          let reg = ApRegex.CAPTURE_SINGLE_REF();
          let r;

          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];
            let referenceField = x.fields.find(f => f.name === reference);

            sqlReal = ApRegex.replaceSingleRefs(
              sqlReal,
              reference,
              referenceField.sql
            );
          }

          field.sql_real = sqlReal;

          // sql_timestamp
          if (field.result === enums.FieldExtResultEnum.Ts) {
            let sqlTimestampReal = field.sql_timestamp; // init

            let reg2 = ApRegex.CAPTURE_SINGLE_REF();
            let r2;

            while ((r2 = reg2.exec(sqlTimestampReal))) {
              let reference2 = r2[1];
              let referenceField2 = x.fields.find(f => f.name === reference2);

              sqlTimestampReal = ApRegex.replaceSingleRefs(
                sqlTimestampReal,
                reference2,
                referenceField2.sql
              );
            }

            field.sql_timestamp_real = sqlTimestampReal;
          }
          break;
        }

        // process measures of Models (they can reference only dimensions - already checked)
        case field.field_class === enums.FieldClassEnum.Measure &&
          x.ext === enums.FileExtensionEnum.Model: {
          let reg = ApRegex.CAPTURE_SINGLE_REF();
          let r;

          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];
            let referenceField = x.fields.find(f => f.name === reference);

            sqlReal = ApRegex.replaceSingleRefs(
              sqlReal,
              reference,
              referenceField.sql
            );
          }

          field.sql_real = sqlReal;

          // sql_key
          if (
            [
              enums.FieldExtTypeEnum.SumByKey,
              enums.FieldExtTypeEnum.AverageByKey,
              enums.FieldExtTypeEnum.MedianByKey,
              enums.FieldExtTypeEnum.PercentileByKey
            ].indexOf(field.type) > -1
          ) {
            let sqlKeyReal = field.sql_key; // init

            let reg2 = ApRegex.CAPTURE_SINGLE_REF();
            let r2;

            while ((r2 = reg2.exec(sqlKeyReal))) {
              let reference2 = r2[1];
              let referenceField2 = x.fields.find(f => f.name === reference2);

              sqlKeyReal = ApRegex.replaceSingleRefs(
                sqlKeyReal,
                reference2,
                referenceField2.sql
              );
            }

            field.sql_key_real = sqlKeyReal;
          }
          break;
        }

        // process measures of Views (they can reference only dimensions - already checked)
        case field.field_class === enums.FieldClassEnum.Measure &&
          x.ext === enums.FileExtensionEnum.View: {
          let reg = ApRegex.CAPTURE_SINGLE_REF_G();
          let r;

          // can't replace here because we leave single references to dimensions untouched
          while ((r = reg.exec(sqlReal))) {
            let reference = r[1];

            x.fields_deps_after_singles[field.name][reference] =
              field.sql_line_num;
          }

          field.sql_real = field.sql; // same as sqlReal

          // sql_key
          if (
            [
              enums.FieldExtTypeEnum.SumByKey,
              enums.FieldExtTypeEnum.AverageByKey,
              enums.FieldExtTypeEnum.MedianByKey,
              enums.FieldExtTypeEnum.PercentileByKey
            ].indexOf(field.type) > -1
          ) {
            let sqlKeyReal = field.sql_key; // init

            let reg2 = ApRegex.CAPTURE_SINGLE_REF_G();
            let r2;

            // can't replace here because we leave single references to dimensions untouched
            while ((r2 = reg2.exec(sqlKeyReal))) {
              let reference2 = r2[1];

              x.fields_deps_after_singles[field.name][reference2] =
                field.sql_key_line_num;
            }

            field.sql_key_real = field.sql_key; // same as sqlKeyReal
          }
          break;
        }

        // process calculations (they can reference anything - already checked)
        case field.field_class === enums.FieldClassEnum.Calculation: {
          // field.prep_force_dims initialized inside while

          let deps: {
            // declared here, initialized inside while
            dep_name: string;
            dep_line_num: number; // line_num that referenced dep
          }[];

          let restart: boolean = true;

          while (restart) {
            restart = false;

            field.prep_force_dims = {}; // needs to be reinitialized after each restart
            deps = []; // needs to be reinitialized after each restart

            let reg = ApRegex.CAPTURE_SINGLE_REF_G(); // g works because of restart
            let r;

            while ((r = reg.exec(sqlReal))) {
              let reference = r[1];

              let referenceField = x.fields.find(f => f.name === reference);

              switch (true) {
                case referenceField.field_class ===
                  enums.FieldClassEnum.Calculation: {
                  sqlReal = ApRegex.replaceSingleRefs(
                    sqlReal,
                    reference,
                    referenceField.sql
                  );

                  restart = true;
                  break;
                }

                case referenceField.field_class ===
                  enums.FieldClassEnum.Dimension: {
                  deps.push({
                    dep_name: reference,
                    dep_line_num: field.sql_line_num
                  });

                  field.prep_force_dims[reference] = field.sql_line_num;
                  break;
                }

                case referenceField.field_class ===
                  enums.FieldClassEnum.Measure: {
                  deps.push({
                    dep_name: reference,
                    dep_line_num: field.sql_line_num
                  });

                  break;
                }
              }
            }
          }

          deps.forEach(dep => {
            x.fields_deps_after_singles[field.name][dep.dep_name] =
              dep.dep_line_num;
          });

          field.sql_real = sqlReal;
          break;
        }

        // process filters just for same logic
        case field.field_class === enums.FieldClassEnum.Filter: {
          field.prep_force_dims = {};
          field.sql_real = sqlReal;
          break;
        }
      }
    });
  });

  return item.entities;
}
