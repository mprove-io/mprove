import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.SubMakeWith;

export function subMakeWith(item: {
  needsAll: interfaces.VarsSub['needsAll'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { needsAll, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<interfaces.VarsSub>({ needsAll });

  let connection = view.connection;
  let myWith: interfaces.VarsSub['myWith'] = [];
  let table: string;

  if (common.isDefined(view.table)) {
    if (connection.type === common.ConnectionTypeEnum.BigQuery) {
      table = '`' + view.table + '`';
    } else if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
      table = view.table;
    }
  } else {
    table = `${constants.DERIVED}__${view.name}`;

    myWith.push(`  ${table} AS (`);
    myWith = myWith.concat(view.derivedTableStart.map(s => `    ${s}`));
    myWith.push('  ),');
  }

  let flats: { [s: string]: number } = {};

  myWith.push(`  ${constants.VIEW}__${view.name} AS (`);
  myWith.push(`    ${constants.SELECT}`);

  let i = 0;

  Object.keys(needsAll).forEach(fieldName => {
    let field = view.fields.find(viewField => viewField.name === fieldName);

    if (field.fieldClass === common.FieldClassEnum.Dimension) {
      if (common.isDefined(field.unnest)) {
        flats[field.unnest] = 1;
      }

      // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
      let sqlSelect = field.sqlReal;
      myWith.push(`      ${sqlSelect} as ${fieldName},`);
      i++;
    }
  });

  if (i === 0) {
    myWith.push(`      1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  helper.chopLastElement(myWith);

  myWith.push(`    ${constants.FROM} ${table}`);

  Object.keys(flats).forEach(flat => {
    myWith.push(`      ${flat}`);
  });

  myWith.push('  ),');

  let varsOutput: interfaces.VarsSub = { myWith };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
