import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { checkCharsInRefs } from './check-chars-in-refs';

export function makeFieldsDeps<
  T extends interfaces.View | interfaces.Model
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach(x => {
    x.fields_deps = {};

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      x.fields_deps[field.name] = {};

      // check chars in captures of sql
      if (!checkCharsInRefs({ x: x, s: field.sql, line: field.sql_line_num })) {
        return;
      }

      let reg = ApRegex.CAPTURE_SINGLE_REF_G();
      let r;

      while ((r = reg.exec(field.sql))) {
        let dep: string = r[1];

        x.fields_deps[field.name][dep] = field.sql_line_num;
      }

      // work with sql_key
      if (
        field.field_class === enums.FieldClassEnum.Measure &&
        !(typeof field.sql_key === 'undefined' || field.sql_key === null)
      ) {
        // check chars in captures of sql_key
        if (
          !checkCharsInRefs({
            x: x,
            s: field.sql_key,
            line: field.sql_key_line_num
          })
        ) {
          return;
        }

        let reg2 = ApRegex.CAPTURE_SINGLE_REF_G();
        let r2;

        while ((r2 = reg2.exec(field.sql_key))) {
          let dep2: string = r2[1];

          x.fields_deps[field.name][dep2] = field.sql_key_line_num;
        }
      }

      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.entities;
}
