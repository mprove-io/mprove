import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';

let func = common.FuncEnum.SubMakeWith;

export function subMakeWith(item: {
  needsAll: common.VarsSub['needsAll'];
  varsSubSteps: common.FileViewPart['varsSubSteps'];
  view: common.FileView;
}) {
  let { needsAll, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<common.VarsSub>({ needsAll });

  let connection = view.connection;
  let myWith: common.VarsSub['myWith'] = [];
  let table: string;

  if (common.isDefined(view.table)) {
    if (connection.type === common.ConnectionTypeEnum.BigQuery) {
      table = '`' + view.table + '`';
    } else if (
      [
        common.ConnectionTypeEnum.PostgreSQL,
        common.ConnectionTypeEnum.ClickHouse,
        common.ConnectionTypeEnum.SnowFlake
      ].indexOf(connection.type) > -1
    ) {
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
    myWith.push(`      1 as ${common.NO_FIELDS_SELECTED},`);
  }

  helper.chopLastElement(myWith);

  myWith.push(`    ${constants.FROM} ${table}`);

  Object.keys(flats).forEach(flat => {
    myWith.push(`      ${flat}`);
  });

  myWith.push('  ),');

  let varsOutput: common.VarsSub = { myWith };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
