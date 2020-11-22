import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

export function composeCalc(item: interfaces.VarsSub) {
  let calc: string[] = [];

  calc = calc.concat(item.query);

  calc.push('');
  calc.push(`${constants.SELECT}`);

  if (item.select.length === 0) {
    calc.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  item.select.forEach(fieldName => {
    let field = item.view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === enums.FieldClassEnum.Dimension
        ? `  ${fieldName},`
        : field.fieldClass === enums.FieldClassEnum.Measure
        ? `  ${fieldName},`
        : field.fieldClass === enums.FieldClassEnum.Calculation
        ? `  ${item.processedFields[fieldName]} as ${fieldName},`
        : '';

    calc.push(selectString);
  });

  // chop
  calc[calc.length - 1] = calc[calc.length - 1].slice(0, -1);

  calc.push(`${constants.FROM} ${constants.VIEW_MAIN}`);

  item.calcQuery = calc;

  return item;
}
