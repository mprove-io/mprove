import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { applyFilter } from './apply-filter';

let func = enums.FuncEnum.ComposeMain;

export function composeMain(item: {
  top: interfaces.VarsSql['top'];
  joins: interfaces.VarsSql['joins'];
  whereMain: interfaces.VarsSql['whereMain'];
  groupMainBy: interfaces.VarsSql['groupMainBy'];
  havingMain: interfaces.VarsSql['havingMain'];
  filterFieldsConditions: interfaces.VarsSql['filterFieldsConditions'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let {
    top,
    joins,
    whereMain,
    groupMainBy,
    havingMain,
    filterFieldsConditions,
    varsSqlSteps,
    model
  } = item;

  let varsInput = common.makeCopy<interfaces.VarsSql>({
    top,
    joins,
    whereMain,
    groupMainBy,
    havingMain,
    filterFieldsConditions
  });

  let mainQuery: interfaces.VarsSql['mainQuery'] = [];

  mainQuery = mainQuery.concat(top);

  let joinsWhere: string[] = [];

  model.joinsSorted
    .filter(
      asName => asName !== model.fromAs && common.isDefined(joins[asName])
    )
    .forEach(asName => {
      let join = model.joins.find(j => j.as === asName);

      if (common.isDefined(join.sqlWhereReal)) {
        // remove ${ } on doubles (no singles exists in _real of sql_where)
        // ${a.city} + ${b.country}   >>>   a.city + b.country
        let sqlWhereFinal = common.MyRegex.removeBracketsOnDoubles(
          join.sqlWhereReal
        );

        joinsWhere.push(`${sqlWhereFinal}`);
      }
    });

  let whereMainLength = 0;

  Object.keys(whereMain).forEach(s => {
    whereMainLength = whereMainLength + whereMain[s].length;
  });

  if (
    joinsWhere.length > 0 ||
    whereMainLength > 0 ||
    common.isDefined(model.sqlAlwaysWhereReal)
  ) {
    mainQuery.push(`    ${constants.WHERE}`);

    joinsWhere.forEach(element => {
      element = applyFilter({
        filterFieldsConditions: filterFieldsConditions,
        as: constants.MF,
        input: element
      });

      mainQuery.push(`      (${element})`);
      mainQuery.push(`      ${constants.AND}`);
    });

    if (common.isDefined(model.sqlAlwaysWhereReal)) {
      // remove ${ } on doubles (no singles exists in _real of sql_always_where)
      // ${a.city} + ${b.country}   >>>   a.city + b.country

      let sqlAlwaysWhereFinal = common.MyRegex.removeBracketsOnDoubles(
        model.sqlAlwaysWhereReal
      );

      sqlAlwaysWhereFinal = applyFilter({
        filterFieldsConditions: filterFieldsConditions,
        as: constants.MF,
        input: sqlAlwaysWhereFinal
      });

      mainQuery.push(`      (${sqlAlwaysWhereFinal})`);
      mainQuery.push(`      ${constants.AND}`);
    }

    Object.keys(whereMain).forEach(element => {
      if (whereMain[element].length > 0) {
        mainQuery = mainQuery.concat(whereMain[element].map(s => `    ${s}`));
        mainQuery.push(`      ${constants.AND}`);
      }
    });

    mainQuery.pop();
  }

  if (groupMainBy.length > 0) {
    let groupMainByString = groupMainBy.join(', ');
    mainQuery.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
  }

  if (Object.keys(havingMain).length > 0) {
    mainQuery.push(`    ${constants.HAVING}`);

    Object.keys(havingMain).forEach(element => {
      if (havingMain[element].length > 0) {
        mainQuery = mainQuery.concat(havingMain[element]);
        mainQuery.push(`      ${constants.AND}`);
      }
    });
    mainQuery.pop();
  }

  mainQuery.push('  )');

  let varsOutput: interfaces.VarsSql = { mainQuery };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
