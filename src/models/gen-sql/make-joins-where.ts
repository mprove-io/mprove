import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function makeJoinsWhere(item: interfaces.Vars) {

  let joinsWhere: string[] = [];

  item.model.joins_sorted
    .filter(asName => asName !== item.model.from_as)
    .forEach(asName => {

      if (!item.joins[asName]) {
        return;
      }

      let join = item.model.joins.find(j => j.as === asName);

      if (typeof join.sql_where_real !== 'undefined' && join.sql_where_real !== null) {

        // remove ${ } on doubles (no singles exists in _real of sql_where)
        // ${a.city} + ${b.country}   >>>   a.city + b.country
        let sqlWhereFinal = ApRegex.removeBracketsOnDoubles(join.sql_where_real);

        joinsWhere.push(`  (${sqlWhereFinal})`);
        joinsWhere.push(` AND`);
      }
    });

  item.joins_where = joinsWhere;

  return item;
}
