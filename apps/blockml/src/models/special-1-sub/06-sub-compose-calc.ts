import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';

let func = common.FuncEnum.SubComposeCalc;

export function subComposeCalc(item: {
  mainQuery: common.VarsSub['mainQuery'];
  select: common.VarsSub['select'];
  processedFields: common.VarsSub['processedFields'];
  varsSubSteps: common.FileViewPart['varsSubSteps'];
  view: common.FileView;
  viewPartName: string;
}) {
  let { mainQuery, select, processedFields, varsSubSteps, view, viewPartName } =
    item;

  let varsInput = common.makeCopy<common.VarsSub>({
    mainQuery,
    select,
    processedFields
  });

  let sub: common.VarsSub['sub'] = [];

  sub.push(`${viewPartName} AS (`);
  sub = sub.concat(mainQuery.map((s: string) => `  ${s}`));
  sub.push(`  ${constants.SELECT}`);

  if (select.length === 0) {
    sub.push(`      1 as ${common.NO_FIELDS_SELECTED},`);
  }

  select.forEach(fieldName => {
    let field = view.fields.find(vField => vField.name === fieldName);

    let selectString =
      field.fieldClass === common.FieldClassEnum.Dimension
        ? `${fieldName},`
        : field.fieldClass === common.FieldClassEnum.Measure
        ? `${fieldName},`
        : field.fieldClass === common.FieldClassEnum.Calculation
        ? `${processedFields[fieldName]} as ${fieldName},`
        : '';

    sub.push(`    ${selectString}`);
  });

  helper.chopLastElement(sub);

  sub.push(`  ${constants.FROM} ${constants.MAIN}__${view.name}`);
  sub.push('),');

  sub = sub.map(s => `  ${s}`);
  sub = sub.map(x => x.trimRight());

  let varsOutput: common.VarsSub = { sub };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
