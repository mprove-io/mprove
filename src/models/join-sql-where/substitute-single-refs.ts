import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function substituteSingleRefs(item: {
  models: interfaces.Model[]
}) {

  item.models.forEach(x => {

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {

        let sqlWhereReal = join.sql_where;

        let reg = ApRegex.CAPTURE_SINGLE_REF();
        let r;

        while (r = reg.exec(sqlWhereReal)) {
          let reference = r[1];
          let referenceField = x.fields.find(f => f.name === reference);

          sqlWhereReal = ApRegex.replaceSingleRefs(sqlWhereReal, reference, referenceField.sql);
        }

        join.sql_where_real = sqlWhereReal;
      });
  });

  return item.models;
}
