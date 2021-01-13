import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { applyFilter } from './apply-filter';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.ComposeCalc;

export function composeCalc(item: {
  filterFieldsConditions: interfaces.VarsSql['filterFieldsConditions'];
  mainQueryProcessed: interfaces.VarsSql['mainQueryProcessed'];
  select: interfaces.VarsSql['select'];
  processedFields: interfaces.VarsSql['processedFields'];
  whereCalc: interfaces.VarsSql['whereCalc'];
  sorts: interfaces.VarsSql['sorts'];
  limit: interfaces.VarsSql['limit'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
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

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    filterFieldsConditions,
    mainQueryProcessed,
    select,
    processedFields,
    whereCalc,
    sorts,
    limit
  });

  let sql: interfaces.VarsSql['sql'] = [];

  sql = sql.concat(mainQueryProcessed);

  sql.push(`${constants.SELECT}`);

  if (select.length === 0) {
    sql.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  select.forEach(element => {
    let r = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);

    let asName = r[1];
    let fieldName = r[2];

    let field =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === api.FieldClassEnum.Dimension
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Measure
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Calculation
        ? `  ${processedFields[element]} as ${asName}_${fieldName},`
        : constants.UNKNOWN_FIELD_CLASS;

    sql.push(selectString);
  });

  helper.chopLastElement(sql);

  sql.push(`${constants.FROM} ${constants.MAIN}`);

  if (
    Object.keys(whereCalc).length > 0 ||
    helper.isDefined(model.sqlAlwaysWhereCalcReal)
  ) {
    sql.push(`${constants.WHERE}`);

    if (helper.isDefined(model.sqlAlwaysWhereCalcReal)) {
      let sqlAlwaysWhereCalcFinal = api.MyRegex.removeBracketsOnCalculationSinglesMf(
        model.sqlAlwaysWhereCalcReal
      );

      sqlAlwaysWhereCalcFinal = api.MyRegex.removeBracketsOnCalculationDoubles(
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

    Object.keys(whereCalc).forEach(element => {
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

      if ((r = api.MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G().exec(part))) {
        let sorter = r[1];
        let desc = r[2];

        let index = select.findIndex(e => e === sorter);
        let n = index + 1;

        let eString = desc ? `${n} ${constants.DESC}` : `${n}`;

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

  let varsOutput: interfaces.VarsSql = { sql };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}