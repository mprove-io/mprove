import { applyFilter } from './apply-filter';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.MakeWith;

export function makeWith(item: {
  filterFieldsConditions: interfaces.VarsSql['filterFieldsConditions'];
  mainText: interfaces.VarsSql['mainText'];
  joins: interfaces.VarsSql['joins'];
  filters: interfaces.VarsSql['filters'];
  needsAll: interfaces.VarsSql['needsAll'];
  mainUdfs: interfaces.VarsSql['mainUdfs'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let {
    filterFieldsConditions,
    mainText,
    joins,
    filters,
    needsAll,
    mainUdfs,
    varsSqlSteps,
    model
  } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    filterFieldsConditions,
    mainText,
    joins,
    filters,
    needsAll,
    mainUdfs
  });

  let withParts: interfaces.VarsSql['withParts'] = {};
  let myWith: interfaces.VarsSql['myWith'] = [];

  let contents: string[] = [];

  // prepare filters for ___timestamp
  let filt: { [s: string]: { [f: string]: number } } = {};

  Object.keys(filters).forEach(element => {
    let r = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
    let asName = r[1];
    let fieldName = r[2];

    if (helper.isUndefined(filt[asName])) {
      filt[asName] = {};
    }
    filt[asName][fieldName] = 1;
  });
  // end of prepare

  model.joinsSorted
    .filter(z => helper.isDefined(joins[z]))
    .forEach(asName => {
      let join = model.joins.find(j => j.as === asName);

      let table;

      if (helper.isDefined(join.view.table)) {
        if (model.connection.type === api.ConnectionTypeEnum.BigQuery) {
          table = '`' + join.view.table + '`';
        } else if (
          model.connection.type === api.ConnectionTypeEnum.PostgreSQL
        ) {
          table = join.view.table;
        }
      } else {
        table = `${join.view.name}__${asName}`;

        let derivedSqlStartText = join.view.derivedTableStart.join('\n');

        derivedSqlStartText = applyFilter({
          filterFieldsConditions: filterFieldsConditions,
          as: asName,
          input: derivedSqlStartText
        });

        let derivedSqlStartTextArray = derivedSqlStartText.split('\n');

        myWith.push(`  ${table}${constants.DERIVED_TABLE_SUFFIX} AS (`);
        myWith = myWith.concat(derivedSqlStartTextArray.map(s => `    ${s}`));
        myWith.push('  ),');

        withParts = Object.assign(withParts, join.view.parts);

        if (helper.isDefined(join.view.udfs)) {
          join.view.udfs.forEach(udf => {
            mainUdfs[udf] = 1;
          });
        }
      }

      let flats: { [s: string]: number } = {};

      if (asName === model.fromAs) {
        contents.push(`${constants.FROM} ${table} as ${asName}`);
      } else {
        let joinTypeString =
          join.type === enums.JoinTypeEnum.Inner
            ? 'INNER JOIN'
            : join.type === enums.JoinTypeEnum.Cross
            ? 'CROSS JOIN'
            : join.type === enums.JoinTypeEnum.Full
            ? 'FULL JOIN'
            : join.type === enums.JoinTypeEnum.FullOuter
            ? 'FULL OUTER JOIN'
            : join.type === enums.JoinTypeEnum.Left
            ? 'LEFT JOIN'
            : join.type === enums.JoinTypeEnum.LeftOuter
            ? 'LEFT OUTER JOIN'
            : join.type === enums.JoinTypeEnum.Right
            ? 'RIGHT JOIN'
            : join.type === enums.JoinTypeEnum.RightOuter
            ? 'RIGHT OUTER JOIN'
            : constants.UNKNOWN_JOIN_TYPE;

        let sqlOnFinal = api.MyRegex.removeBracketsOnDoubles(join.sqlOnReal);

        contents.push(
          `${joinTypeString} ${table} as ${asName} ${constants.ON} ${sqlOnFinal}`
        );
      }

      myWith.push(`  ${table} AS (`);
      myWith.push(`    ${constants.SELECT}`);

      let i = 0;

      // check for need of ___timestamp
      if (helper.isDefined(filt[asName])) {
        // $as ne 'mf' (by design)
        let once: { [s: string]: number } = {};

        Object.keys(filt[asName]).forEach(fieldName => {
          let field = join.view.fields.find(f => f.name === fieldName);

          if (field.result === api.FieldResultEnum.Ts) {
            // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
            let sqlTimestampSelect = field.sqlTimestampReal;
            let sqlTimestampName = field.sqlTimestampName;

            if (helper.isDefined(once[sqlTimestampName])) {
              return;
            }
            once[sqlTimestampName] = 1;
            myWith.push(`      ${sqlTimestampSelect} as ${sqlTimestampName},`);
            i++;
          }
        });
      }

      if (needsAll[asName]) {
        // $as ne 'mf' (by design)
        Object.keys(needsAll[asName]).forEach(fieldName => {
          let field = join.view.fields.find(f => f.name === fieldName);

          if (field.fieldClass === api.FieldClassEnum.Dimension) {
            if (helper.isDefined(field.unnest)) {
              flats[field.unnest] = 1;
            }
            // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
            let sqlSelect = field.sqlReal;
            myWith.push(`      ${sqlSelect} as ${fieldName},`);
            i++;
          }
        });
      }

      if (i === 0) {
        myWith.push(`      1 as ${constants.NO_FIELDS_SELECTED},`);
      }

      helper.chopLastElement(myWith);

      myWith.push(
        `    ${constants.FROM} ${table}${constants.DERIVED_TABLE_SUFFIX}`
      );

      Object.keys(flats).forEach(flat => myWith.push(`    ${flat}`));

      myWith.push('  ),');
    });

  myWith.push(`  ${constants.MODEL_MAIN} AS (`);
  myWith.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    myWith.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  myWith = myWith.concat(mainText.map(s => `    ${s}`));

  helper.chopLastElement(myWith);

  myWith = myWith.concat(contents.map(s => `    ${s}`));

  let varsOutput: interfaces.VarsSql = { myWith, withParts };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
