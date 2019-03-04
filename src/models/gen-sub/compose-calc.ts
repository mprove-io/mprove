import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function composeCalc(item: interfaces.VarsSub) {

  let calc: string[] = [];

  calc = calc.concat(item.query);

  calc.push(``);
  calc.push(`SELECT`);

  if (item.select.length === 0) {
    calc.push(`    1 as no_fields_selected,`);
  }

  item.select.forEach(fieldName => {

    let field = item.view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.field_class === enums.FieldClassEnum.Dimension
        ? `  ${fieldName},`
        : field.field_class === enums.FieldClassEnum.Measure
          ? `  ${fieldName},`
          : field.field_class === enums.FieldClassEnum.Calculation
            ? `  ${item.processed_fields[fieldName]} as ${fieldName},`
            : ``;

    calc.push(selectString);
  });

  // chop
  calc[calc.length - 1] = calc[calc.length - 1].slice(0, -1);

  calc.push(`FROM view_main`);

  item.calc_query = calc;

  return item;
}