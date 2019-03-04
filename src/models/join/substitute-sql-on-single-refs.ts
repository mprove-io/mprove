import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function substituteSqlOnSingleRefs(item: {
  models: interfaces.Model[];
}) {
  item.models.forEach(x => {
    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {
        let sqlOnReal = join.sql_on;

        let reg = ApRegex.CAPTURE_SINGLE_REF();
        let r;

        while ((r = reg.exec(sqlOnReal))) {
          let reference = r[1];
          let referenceField = x.fields.find(f => f.name === reference);

          sqlOnReal = ApRegex.replaceSingleRefs(
            sqlOnReal,
            reference,
            referenceField.sql
          );
        }

        join.sql_on_real = sqlOnReal;
      });
  });

  return item.models;
}
