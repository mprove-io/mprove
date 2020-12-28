import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.MakeJoinsWhere;

export function makeJoinsWhere(item: {
  joins: interfaces.VarsSql['joins'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { joins, varsSqlSteps, model } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({ joins });

  let joinsWhere: interfaces.VarsSql['joinsWhere'] = [];

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

  let varsOutput: interfaces.VarsSql = { joinsWhere };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
