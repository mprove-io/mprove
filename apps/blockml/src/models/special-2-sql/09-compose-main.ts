import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { applyFilter } from './apply-filter';

let func = common.FuncEnum.ComposeMain;

export function composeMain(item: {
  top: common.VarsSql['top'];
  joins: common.VarsSql['joins'];
  whereMain: common.VarsSql['whereMain'];
  groupMainBy: common.VarsSql['groupMainBy'];
  havingMain: common.VarsSql['havingMain'];
  filterFieldsConditions: common.VarsSql['filterFieldsConditions'];
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
  model: common.FileModel;
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

  let varsInput = common.makeCopy<common.VarsSql>({
    top,
    joins,
    whereMain,
    groupMainBy,
    havingMain,
    filterFieldsConditions
  });

  let mainQuery: common.VarsSql['mainQuery'] = [];

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

    Object.keys(whereMain)
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
      .forEach(element => {
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

  let varsOutput: common.VarsSql = { mainQuery };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
