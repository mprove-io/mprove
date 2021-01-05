import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.SubComposeCalc;

export function subComposeCalc(item: {
  mainQuery: interfaces.VarsSub['mainQuery'];
  select: interfaces.VarsSub['select'];
  processedFields: interfaces.VarsSub['processedFields'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
  viewPartName: string;
}) {
  let {
    mainQuery,
    select,
    processedFields,
    varsSubSteps,
    view,
    viewPartName
  } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSub>({
    mainQuery,
    select,
    processedFields
  });

  let sub: interfaces.VarsSub['sub'] = [];

  sub.push(`${viewPartName} AS (`);
  sub = sub.concat(mainQuery.map((s: string) => `  ${s}`));
  sub.push(`  ${constants.SELECT}`);

  if (select.length === 0) {
    sub.push(`      1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  select.forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === api.FieldClassEnum.Dimension
        ? `${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Measure
        ? `${fieldName},`
        : field.fieldClass === api.FieldClassEnum.Calculation
        ? `${processedFields[fieldName]} as ${fieldName},`
        : '';

    sub.push(`    ${selectString}`);
  });

  helper.chopLastElement(sub);

  sub.push(`  ${constants.FROM} ${constants.MAIN}__${view.name}`);
  sub.push('),');

  sub = sub.map(s => `  ${s}`);
  sub = sub.map(x => x.trimRight());

  let varsOutput: interfaces.VarsSub = { sub };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
