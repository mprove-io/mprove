import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeContents(item: interfaces.VarsSub) {
  let contents: string[] = [];

  let myWith: string[] = [];

  let flats: {
    [s: string]: number;
  } = {};

  contents.push(`FROM (`);

  contents.push(`  SELECT`);

  let i: number = 0;

  Object.keys(item.needs_all).forEach(fieldName => {
    let field = item.view.fields.find(
      viewField => viewField.name === fieldName
    );

    if (field.field_class === enums.FieldClassEnum.Dimension) {
      if (typeof field.unnest !== 'undefined' && field.unnest !== null) {
        flats[field.unnest] = 1;
      }

      // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
      let sqlSelect = field.sql_real;

      contents.push(`    ${sqlSelect} as ${fieldName},`);

      i++;
    }
  });

  if (i === 0) {
    contents.push(`    1 as no_fields_selected,`);
  }

  // chop
  contents[contents.length - 1] = contents[contents.length - 1].slice(0, -1);

  let table;

  if (typeof item.view.table !== 'undefined' && item.view.table !== null) {
    table = '`' + item.view.table + '`';
  } else if (item.view.permanent.match(ApRegex.TRUE())) {
    table =
      '`' +
      `${item.bqProject}.mprove_${item.projectId}.${item.structId}_${
        item.view.name
      }` +
      '`';
  } else {
    let derivedSqlArray = item.view.derived_table.split('\n');

    myWith.push(`  ${item.view.name}__derived_table AS (`);
    myWith = myWith.concat(derivedSqlArray.map(s => `    ${s}`));
    myWith.push(`  ),`);
    myWith.push(``);

    table = `${item.view.name}__derived_table`;
  }

  contents.push(`  FROM ${table}`);

  Object.keys(flats).forEach(flat => {
    contents.push(`    ${flat}`);
  });

  contents.push(`  )`);

  item.contents = contents;
  item.with = myWith;

  return item;
}
