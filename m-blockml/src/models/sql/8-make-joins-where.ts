import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';

export function makeJoinsWhere(item: interfaces.VarsSql) {
  let joinsWhere: string[] = [];

  item.model.joinsSorted
    .filter(asName => asName !== item.model.fromAs)
    .forEach(asName => {
      if (helper.isUndefined(item.joins[asName])) {
        return;
      }

      let join = item.model.joins.find(j => j.as === asName);

      if (helper.isDefined(join.sqlWhereReal)) {
        // remove ${ } on doubles (no singles exists in _real of sql_where)
        // ${a.city} + ${b.country}   >>>   a.city + b.country
        let sqlWhereFinal = api.MyRegex.removeBracketsOnDoubles(
          join.sqlWhereReal
        );

        joinsWhere.push(`  (${sqlWhereFinal})`);
        joinsWhere.push(` ${constants.AND}`);
      }
    });

  item.joinsWhere = joinsWhere;

  return item;
}
