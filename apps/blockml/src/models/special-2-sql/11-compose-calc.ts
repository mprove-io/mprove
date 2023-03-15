import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { applyFilter } from './apply-filter';

let func = common.FuncEnum.ComposeCalc;

export function composeCalc(item: {
  filterFieldsConditions: common.VarsSql['filterFieldsConditions'];
  mainQueryProcessed: common.VarsSql['mainQueryProcessed'];
  select: common.VarsSql['select'];
  processedFields: common.VarsSql['processedFields'];
  whereCalc: common.VarsSql['whereCalc'];
  sorts: common.VarsSql['sorts'];
  limit: common.VarsSql['limit'];
  varsSqlSteps: common.FileReport['varsSqlSteps'];
  model: common.FileModel;
}) {
  let {
    filterFieldsConditions,
    mainQueryProcessed,
    select,
    processedFields,
    whereCalc,
    sorts,
    limit,
    varsSqlSteps,
    model
  } = item;

  let varsInput = common.makeCopy<common.VarsSql>({
    filterFieldsConditions,
    mainQueryProcessed,
    select,
    processedFields,
    whereCalc,
    sorts,
    limit
  });

  let sql: common.VarsSql['sql'] = [];

  sql = sql.concat(mainQueryProcessed);

  sql.push(`${constants.SELECT}`);

  if (select.length === 0) {
    sql.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  select.forEach(element => {
    let r =
      common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);

    let asName = r[1];
    let fieldName = r[2];

    let field =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === common.FieldClassEnum.Dimension
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === common.FieldClassEnum.Measure
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === common.FieldClassEnum.Calculation
        ? `  ${processedFields[element]} as ${asName}_${fieldName},`
        : constants.UNKNOWN_FIELD_CLASS;

    sql.push(selectString);
  });

  helper.chopLastElement(sql);

  sql.push(`${constants.FROM} ${constants.MAIN}`);

  if (
    Object.keys(whereCalc).length > 0 ||
    common.isDefined(model.sqlAlwaysWhereCalcReal)
  ) {
    sql.push(`${constants.WHERE}`);

    if (common.isDefined(model.sqlAlwaysWhereCalcReal)) {
      let sqlAlwaysWhereCalcFinal =
        common.MyRegex.removeBracketsOnCalculationSinglesMf(
          model.sqlAlwaysWhereCalcReal
        );

      sqlAlwaysWhereCalcFinal =
        common.MyRegex.removeBracketsOnCalculationDoubles(
          sqlAlwaysWhereCalcFinal
        );

      sqlAlwaysWhereCalcFinal = applyFilter({
        filterFieldsConditions: filterFieldsConditions,
        as: constants.MF,
        input: sqlAlwaysWhereCalcFinal
      });

      sql.push(`  (${sqlAlwaysWhereCalcFinal})`);
      sql.push(`  ${constants.AND}`);
    }

    Object.keys(whereCalc)
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
      .forEach(element => {
        if (whereCalc[element].length > 0) {
          sql = sql.concat(whereCalc[element]);
          sql.push(`  ${constants.AND}`);
        }
      });

    sql.pop();
  }

  if (sorts) {
    let mySorts = sorts.split(',');

    let orderBy: string[] = [];

    mySorts.forEach(part => {
      let r;

      if ((r = common.MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G().exec(part))) {
        let sorter = r[1];
        let desc = r[2];

        let index = select.findIndex(e => e === sorter);
        let n = index + 1;

        let sortName =
          model.connection.type === common.ConnectionTypeEnum.ClickHouse
            ? sorter.split('.').join('_')
            : n;

        let eString = desc ? `${sortName} ${constants.DESC}` : `${sortName}`;

        orderBy.push(eString);
      }
    });

    let orderByString = orderBy.join(', ');

    if (orderByString) {
      sql.push(`${constants.ORDER_BY} ${orderByString}`);
    }
  }

  sql.push(`${constants.LIMIT} ${limit}`);

  sql = sql.map(x => x.trimRight());

  let varsOutput: common.VarsSql = { sql };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
