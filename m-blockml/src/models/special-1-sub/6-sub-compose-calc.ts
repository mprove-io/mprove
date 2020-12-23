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
  varsSubArray: interfaces.ViewPart['varsSubElements'];
  view: interfaces.View;
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { mainQuery, select, processedFields, view, structId, caller } = item;

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

  let varsSubElement: interfaces.VarsSubElement = {
    func: func,
    varsSubInput: varsSubInput,
    varsSubOutput: output
  };
  item.varsSubArray.push(varsSubElement);

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return output;
}
