import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { helper } from '../../barrels/helper';
import { applyFilter } from './apply-filter';

export function makeContents(item: interfaces.VarsSql) {
  let contents: string[] = [];

  let myWith: string[] = [];

  // prepare filters for ___timestamp
  let filt: {
    [s: string]: {
      [f: string]: number;
    };
  } = {};

  Object.keys(item.filters).forEach(element => {
    let r = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
    let asName = r[1];
    let fieldName = r[2];

    if (!filt[asName]) {
      filt[asName] = {};
    }
    filt[asName][fieldName] = 1;
  });
  // end of prepare

  item.model.joinsSorted.forEach(asName => {
    let flats: {
      [s: string]: number;
    } = {};

    let join = item.model.joins.find(j => j.as === asName);

    if (asName === item.model.fromAs) {
      contents.push(`${constants.FROM} (`);
    } else if (item.joins[asName]) {
      let joinTypeString =
        join.type === enums.JoinTypeEnum.Inner
          ? 'INNER JOIN ('
          : join.type === enums.JoinTypeEnum.Cross
          ? 'CROSS JOIN ('
          : join.type === enums.JoinTypeEnum.Full
          ? 'FULL JOIN ('
          : join.type === enums.JoinTypeEnum.FullOuter
          ? 'FULL OUTER JOIN ('
          : join.type === enums.JoinTypeEnum.Left
          ? 'LEFT JOIN ('
          : join.type === enums.JoinTypeEnum.LeftOuter
          ? 'LEFT OUTER JOIN ('
          : join.type === enums.JoinTypeEnum.Right
          ? 'RIGHT JOIN ('
          : join.type === enums.JoinTypeEnum.RightOuter
          ? 'RIGHT OUTER JOIN ('
          : undefined;

      contents.push(joinTypeString);
    } else {
      return;
    }

    contents.push(`  ${constants.SELECT}`);

    let i = 0;

    // check for need of ___timestamp
    // $as ne 'mf' (by design)
    if (filt[asName]) {
      let once: { [s: string]: number } = {};

      Object.keys(filt[asName]).forEach(fieldName => {
        let field = join.view.fields.find(
          viewField => viewField.name === fieldName
        );

        if (field.result === api.FieldAnyResultEnum.Ts) {
          // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
          let sqlTimestampSelect = field.sqlTimestampReal;

          let sqlTimestampName = field.sqlTimestampName;

          if (once[sqlTimestampName]) {
            return;
          }

          once[sqlTimestampName] = 1;

          contents.push(`    ${sqlTimestampSelect} as ${sqlTimestampName},`);

          i++;
        }
      });
    }
    // end of check

    if (item.needsAll[asName]) {
      // $as ne 'mf' (by design)

      Object.keys(item.needsAll[asName]).forEach(fieldName => {
        let field = join.view.fields.find(
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
    }

    if (i === 0) {
      contents.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
    }

    // chop
    contents[contents.length - 1] = contents[contents.length - 1].slice(0, -1);

    let table;

    if (helper.isDefined(join.view.table)) {
      if (item.model.connection.type === api.ConnectionTypeEnum.BigQuery) {
        table = '`' + join.view.table + '`';
      } else if (
        item.model.connection.type === api.ConnectionTypeEnum.PostgreSQL
      ) {
        table = join.view.table;
      }
    } else {
      let derivedSqlStart = join.view.derivedTableStart;

      derivedSqlStart = applyFilter(item, asName, derivedSqlStart);

      let derivedSqlStartArray = derivedSqlStart.split('\n');

      myWith.push(`  ${join.view.name}__${asName} AS (`);
      myWith.push(derivedSqlStartArray.map(s => `    ${s}`).join('\n'));
      myWith.push('  ),');
      myWith.push('');

      item.withParts = Object.assign({}, item.withParts, join.view.parts);

      if (helper.isDefined(join.view.udfs)) {
        join.view.udfs.forEach(udf => {
          item.mainUdfs[udf] = 1;
        });
      }

      table = `${join.view.name}__${asName}`;
    }

    contents.push(`  ${constants.FROM} ${table}`);

    Object.keys(flats).forEach(flat => {
      contents.push(`    ${flat}`);
    });

    contents.push(`  ) as ${asName}`);

    if (asName !== item.model.fromAs) {
      let sqlOnFinal = api.MyRegex.removeBracketsOnDoubles(join.sqlOnReal);

      contents.push(`${constants.ON} ${sqlOnFinal}`);
    }

    contents.push('');
  });

  item.contents = contents;
  item.with = myWith;

  return item;
}
