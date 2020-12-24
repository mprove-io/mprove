import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { BmError } from '../bm-error';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.SubComposeCalc;

export function subComposeCalc(item: {
  mainQuery: interfaces.VarsSub['mainQuery'];
  select: interfaces.VarsSub['select'];
  processedFields: interfaces.VarsSub['processedFields'];
  varsSubElements: interfaces.ViewPart['varsSubElements'];
  view: interfaces.View;
}) {
  let { mainQuery, select, processedFields, view } = item;

  let varsSubInput: interfaces.VarsSub = helper.makeCopy({
    mainQuery,
    select,
    processedFields
  });

  let calcQuery: interfaces.VarsSub['calcQuery'] = [];

  calcQuery = calcQuery.concat(mainQuery);

  calcQuery.push('');
  calcQuery.push(`${constants.SELECT}`);

  if (select.length === 0) {
    calcQuery.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  select.forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === api.FieldClassEnum.Dimension
        ? `  ${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Measure
        ? `  ${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Calculation
        ? `  ${processedFields[fieldName]} as ${fieldName},`
        : '';

    calcQuery.push(selectString);
  });

  // chop
  let lastIndex = calcQuery.length - 1;
  calcQuery[lastIndex] = calcQuery[lastIndex].slice(0, -1);

  calcQuery.push(`${constants.FROM} ${constants.VIEW_MAIN}`);

  let output: interfaces.VarsSub = { calcQuery };

  item.varsSubElements.push({
    func: func,
    varsSubInput: varsSubInput,
    varsSubOutput: output
  });

  return output;
}
