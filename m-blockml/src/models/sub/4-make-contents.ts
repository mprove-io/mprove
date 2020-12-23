import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.MakeContents;

export function makeContents(item: {
  needsAll: interfaces.VarsSub['needsAll'];
  view: interfaces.View;
  varsSubArray: interfaces.ViewPart['varsSubElements'];
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { needsAll, view, structId, caller } = item;

  let varsSubInput: interfaces.VarsSub = helper.makeCopy({ needsAll });

  let connection = view.connection;

  let contents: interfaces.VarsSub['contents'] = [];

  let myWith: interfaces.VarsSub['myWith'] = [];

  let flats: {
    [s: string]: number;
  } = {};

  contents.push(`${constants.FROM} (`);

  contents.push(`  ${constants.SELECT}`);

  let i = 0;

  Object.keys(needsAll).forEach(fieldName => {
    let field = view.fields.find(viewField => viewField.name === fieldName);

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

  if (helper.isDefined(view.table)) {
    if (connection.type === api.ConnectionTypeEnum.BigQuery) {
      table = '`' + view.table + '`';
    } else if (connection.type === api.ConnectionTypeEnum.PostgreSQL) {
      table = view.table;
    }
  } else {
    let derivedSqlArray = view.derived_table.split('\n');

    table = view.name + constants.DERIVED_TABLE_SUFFIX;

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

  let output: interfaces.VarsSub = { contents, myWith };

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
