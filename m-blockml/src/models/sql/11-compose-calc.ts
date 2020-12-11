import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { applyFilter } from './apply-filter';
import { helper } from '../../barrels/helper';

export function composeCalc(item: interfaces.VarsSql) {
  let calc: string[] = [];

  calc = calc.concat(item.query);

  calc.push(constants.EMPTY_STRING);
  calc.push(`${constants.SELECT}`);

  if (item.select.length === 0) {
    calc.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  item.select.forEach(element => {
    let r = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);

    let asName = r[1];
    let fieldName = r[2];

    let field =
      asName === constants.MF
        ? item.model.fields.find(mField => mField.name === fieldName)
        : item.model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === api.FieldClassEnum.Dimension
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Measure
        ? `  ${asName}_${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Calculation
        ? `  ${item.processedFields[element]} as ${asName}_${fieldName},`
        : constants.EMPTY_STRING;

    calc.push(selectString);
  });

  // chop
  calc[calc.length - 1] = calc[calc.length - 1].slice(0, -1);

  calc.push(`${constants.FROM} ${constants.MODEL_MAIN}`);
  calc.push(constants.EMPTY_STRING);

  if (
    Object.keys(item.whereCalc).length > 0 ||
    helper.isDefined(item.model.sqlAlwaysWhereCalcReal)
  ) {
    calc.push(`${constants.WHERE}`);

    if (helper.isDefined(item.model.sqlAlwaysWhereCalcReal)) {
      let sqlAlwaysWhereCalcFinal = api.MyRegex.removeBracketsOnCalculationSinglesMf(
        item.model.sqlAlwaysWhereCalcReal
      );

      sqlAlwaysWhereCalcFinal = api.MyRegex.removeBracketsOnCalculationDoubles(
        sqlAlwaysWhereCalcFinal
      );

      sqlAlwaysWhereCalcFinal = applyFilter(
        item,
        constants.MF,
        sqlAlwaysWhereCalcFinal
      );

      calc.push(`  (${sqlAlwaysWhereCalcFinal})`);
      calc.push(` ${constants.AND}`);
    }

    Object.keys(item.whereCalc).forEach(element => {
      if (item.whereCalc[element].length > 0) {
        calc = calc.concat(item.whereCalc[element]);
        calc.push(` ${constants.AND}`);
      }
    });

    calc.pop();
    calc.push(constants.EMPTY_STRING);
  }

  if (item.sorts) {
    let mySorts = item.sorts.split(',');

    let orderBy: string[] = [];

    mySorts.forEach(part => {
      let r;

      if ((r = api.MyRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G().exec(part))) {
        let sorter = r[1];
        let desc = r[2];

        let index = item.select.findIndex(e => e === sorter);
        let n = index + 1;

        let eString = desc ? `${n} ${constants.DESC}` : `${n}`;

        orderBy.push(eString);
      }
    });

    let orderByString = orderBy.join(', ');

    if (orderByString) {
      calc.push(`${constants.ORDER_BY} ${orderByString}`);
    }
  }

  calc.push(`${constants.LIMIT} ${item.limit}`);

  item.query = calc;

  return item;
}
