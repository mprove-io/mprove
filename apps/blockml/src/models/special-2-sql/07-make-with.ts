import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { applyFilter } from './apply-filter';

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

  let varsInput = common.makeCopy<interfaces.VarsSql>({
    filterFieldsConditions,
    mainText,
    joins,
    filters,
    needsAll,
    mainUdfs
  });

  let withParts: interfaces.VarsSql['withParts'] = {};
  let withDerivedTables: interfaces.VarsSql['withDerivedTables'] = [];
  let withViews: interfaces.VarsSql['withViews'] = [];

  let contents: string[] = [];

  // prepare filters for ___timestamp
  let filt: { [s: string]: { [f: string]: number } } = {};

  Object.keys(filters).forEach(element => {
    let r =
      common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
    let asName = r[1];
    let fieldName = r[2];

    if (common.isUndefined(filt[asName])) {
      filt[asName] = {};
    }
    filt[asName][fieldName] = 1;
  });
  // end of prepare

  model.joinsSorted
    .filter(y => common.isDefined(joins[y]))
    .forEach(asName => {
      let join = model.joins.find(j => j.as === asName);

      let viewTable = `${constants.VIEW}__${join.view.name}__${asName}`;

      let sourceTable;

      if (common.isDefined(join.view.table)) {
        if (model.connection.type === common.ConnectionTypeEnum.BigQuery) {
          sourceTable = '`' + join.view.table + '`';
        } else if (
          [
            common.ConnectionTypeEnum.PostgreSQL,
            common.ConnectionTypeEnum.SnowFlake,
            common.ConnectionTypeEnum.ClickHouse
          ].indexOf(model.connection.type) > -1
        ) {
          sourceTable = join.view.table;
        }
      } else {
        sourceTable = `${constants.DERIVED}__${join.view.name}__${asName}`;

        if (common.isDefined(join.view.udfs)) {
          join.view.udfs.forEach(udf => {
            mainUdfs[udf] = 1;
          });
        }

        withParts = Object.assign(withParts, join.view.parts);

        let derivedSqlStartText = applyFilter({
          filterFieldsConditions: filterFieldsConditions,
          as: asName,
          input: join.view.derivedTableStart.join('\n')
        });

        withDerivedTables.push(`  ${sourceTable} AS (`);
        withDerivedTables = withDerivedTables.concat(
          derivedSqlStartText.split('\n').map(s => `    ${s}`)
        );
        withDerivedTables.push('  ),');
      }

      let flats: { [s: string]: number } = {};

      if (asName === model.fromAs) {
        contents.push(`${constants.FROM} ${viewTable} as ${asName}`);
      } else {
        let joinTypeString =
          join.type === common.JoinTypeEnum.Inner
            ? 'INNER JOIN'
            : join.type === common.JoinTypeEnum.Cross
            ? 'CROSS JOIN'
            : join.type === common.JoinTypeEnum.Full
            ? 'FULL JOIN'
            : join.type === common.JoinTypeEnum.FullOuter
            ? 'FULL OUTER JOIN'
            : join.type === common.JoinTypeEnum.Left
            ? 'LEFT JOIN'
            : join.type === common.JoinTypeEnum.LeftOuter
            ? 'LEFT OUTER JOIN'
            : join.type === common.JoinTypeEnum.Right
            ? 'RIGHT JOIN'
            : join.type === common.JoinTypeEnum.RightOuter
            ? 'RIGHT OUTER JOIN'
            : constants.UNKNOWN_JOIN_TYPE;

        let sqlOnFinal = common.MyRegex.removeBracketsOnDoubles(join.sqlOnReal);

        contents.push(
          `${joinTypeString} ${viewTable} as ${asName} ${constants.ON} ${sqlOnFinal}`
        );
      }

      withViews.push(`  ${viewTable} AS (`);
      withViews.push(`    ${constants.SELECT}`);

      let i = 0;

      // check for need of ___timestamp
      if (common.isDefined(filt[asName])) {
        // $as ne 'mf' (by design)
        let once: { [s: string]: number } = {};

        Object.keys(filt[asName]).forEach(fieldName => {
          let field = join.view.fields.find(f => f.name === fieldName);

          if (field.result === common.FieldResultEnum.Ts) {
            // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
            let sqlTimestampSelect = field.sqlTimestampReal;
            let sqlTimestampName = field.sqlTimestampName;

            if (common.isDefined(once[sqlTimestampName])) {
              return;
            }
            once[sqlTimestampName] = 1;
            let selTs = `      ${sqlTimestampSelect} as ${sqlTimestampName},`;
            withViews = withViews.concat(selTs.split('\n'));
            i++;
          }
        });
      }

      if (needsAll[asName]) {
        // $as ne 'mf' (by design)
        Object.keys(needsAll[asName]).forEach(fieldName => {
          let field = join.view.fields.find(f => f.name === fieldName);

          if (field.fieldClass === common.FieldClassEnum.Dimension) {
            if (common.isDefined(field.unnest)) {
              flats[field.unnest] = 1;
            }
            // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
            let sqlSelect = field.sqlReal;
            let sel = `      ${sqlSelect} as ${fieldName},`;
            withViews = withViews.concat(sel.split('\n'));
            i++;
          }
        });
      }

      if (i === 0) {
        withViews.push(`      1 as ${constants.NO_FIELDS_SELECTED},`);
      }

      helper.chopLastElement(withViews);

      withViews.push(`    ${constants.FROM} ${sourceTable}`);

      Object.keys(flats).forEach(flat => withViews.push(`    ${flat}`));

      withViews.push('  ),');
    });

  withViews.push(`  ${constants.MAIN} AS (`);
  withViews.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    withViews.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  withViews = withViews.concat(mainText.map(s => `    ${s}`));

  helper.chopLastElement(withViews);

  withViews = withViews.concat(contents.map(s => `    ${s}`));

  let varsOutput: interfaces.VarsSql = {
    withParts,
    withDerivedTables,
    withViews
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
