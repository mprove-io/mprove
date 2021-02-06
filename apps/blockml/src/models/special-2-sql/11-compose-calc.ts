import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { applyFilter } from './apply-filter';

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
    let r = common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(
      element
    );

    let asName = r[1];
    let fieldName = r[2];

    let field =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === apiToBlockml.FieldClassEnum.Dimension
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === apiToBlockml.FieldClassEnum.Measure
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === apiToBlockml.FieldClassEnum.Calculation
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
      let sqlAlwaysWhereCalcFinal = common.MyRegex.removeBracketsOnCalculationSinglesMf(
        model.sqlAlwaysWhereCalcReal
      );

      sqlAlwaysWhereCalcFinal = common.MyRegex.removeBracketsOnCalculationDoubles(
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

      if ((r = common.MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G().exec(part))) {
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
