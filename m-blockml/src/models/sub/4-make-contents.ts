import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';

export function makeContents(item: interfaces.VarsSub) {
  let contents: string[] = [];

  let myWith: string[] = [];

  let flats: {
    [s: string]: number;
  } = {};

  contents.push(`${constants.FROM} (`);

  contents.push(`  ${constants.SELECT}`);

  let i = 0;

  Object.keys(item.needsAll).forEach(fieldName => {
    let field = item.view.fields.find(
      viewField => viewField.name === fieldName
    );

    if (field.fieldClass === api.FieldClassEnum.Dimension) {
      if (helper.isDefined(field.unnest)) {
        flats[field.unnest] = 1;
      }

      // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
      let sqlSelect = field.sqlReal;

      contents.push(`    ${sqlSelect} as ${fieldName},`);

      i++;
    }
  });

  if (i === 0) {
    contents.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  // chop
  contents[contents.length - 1] = contents[contents.length - 1].slice(0, -1);

  let table: string;

  if (helper.isDefined(item.view.table)) {
    if (item.connection.type === api.ConnectionTypeEnum.BigQuery) {
      table = '`' + item.view.table + '`';
    } else if (item.connection.type === api.ConnectionTypeEnum.PostgreSQL) {
      table = item.view.table;
    }
  } else {
    let derivedSqlArray = item.view.derived_table.split('\n');

    table = item.view.name + constants.DERIVED_TABLE_SUFFIX;

    myWith.push(`  ${table} AS (`);
    myWith = myWith.concat(derivedSqlArray.map(s => `    ${s}`));
    myWith.push('  ),');
    myWith.push('');
  }

  contents.push(`  ${constants.FROM} ${table}`);

  Object.keys(flats).forEach(flat => {
    contents.push(`    ${flat}`);
  });

  contents.push(`  ) as ${constants.VIEW_MAIN_SUB}`);

  item.contents = contents;
  item.with = myWith;

  return item;
}
