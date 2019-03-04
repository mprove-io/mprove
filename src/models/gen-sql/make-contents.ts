import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeContents(item: interfaces.Vars) {

  let contents: string[] = [];

  // let bqViews: MyBqView[] = [];

  let myWith: string[] = [];

  // prepare filters for ___timestamp
  let filt: {
    [s: string]: {
      [f: string]: number
    }
  } = {};

  Object.keys(item.filters).forEach(element => {
    let r = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
    let asName = r[1];
    let fieldName = r[2];

    if (!filt[asName]) {
      filt[asName] = {};
    }
    filt[asName][fieldName] = 1;
  });
  // end of prepare

  // let usedViews: { [s: string]: number } = {};

  item.model.joins_sorted.forEach(asName => {

    let flats: {
      [s: string]: number
    } = {};

    let join = item.model.joins.find(j => j.as === asName);

    if (asName === item.model.from_as) {
      contents.push(`FROM (`);

    } else if (item.joins[asName]) {

      let joinTypeString =
        join.type === enums.JoinTypeEnum.Inner
          ? `INNER JOIN (`
          : join.type === enums.JoinTypeEnum.Cross
            ? `CROSS JOIN (`
            : join.type === enums.JoinTypeEnum.Full
              ? `FULL JOIN (`
              : join.type === enums.JoinTypeEnum.FullOuter
                ? `FULL OUTER JOIN (`
                : join.type === enums.JoinTypeEnum.Left
                  ? `LEFT JOIN (`
                  : join.type === enums.JoinTypeEnum.LeftOuter
                    ? `LEFT OUTER JOIN (`
                    : join.type === enums.JoinTypeEnum.Right
                      ? `RIGHT JOIN (`
                      : join.type === enums.JoinTypeEnum.RightOuter
                        ? `RIGHT OUTER JOIN (`
                        : undefined;

      contents.push(joinTypeString);

    } else {
      return;
    }

    contents.push(`  SELECT`);

    let i: number = 0;

    // check for need of ___timestamp
    // $as ne 'mf' (by design)
    if (filt[asName]) {

      let once: { [s: string]: number } = {};

      Object.keys(filt[asName]).forEach(fieldName => {

        let field = join.view.fields.find(viewField => viewField.name === fieldName);

        if (field.result === enums.FieldExtResultEnum.Ts) {

          // no need to remove ${ } (no singles or doubles exists in _real of view dimensions)
          let sqlTimestampSelect = field.sql_timestamp_real;

          let sqlTimestampName = field.sql_timestamp_name;

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


    if (item.needs_all[asName]) {
      // $as ne 'mf' (by design)

      Object.keys(item.needs_all[asName]).forEach(fieldName => {

        let field = join.view.fields.find(viewField => viewField.name === fieldName);

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
    }

    if (i === 0) {
      contents.push(`    1 as no_fields_selected,`);
    }

    // chop
    contents[contents.length - 1] = contents[contents.length - 1].slice(0, -1);

    let table;

    if (typeof join.view.table !== 'undefined' && join.view.table !== null) {

      // if (typeof join.view.udfs !== 'undefined' && join.view.udfs !== null) {
      //   join.view.udfs.forEach(udf => {
      //     item.main_udfs[udf] = 1;
      //   });
      // }

      table = '`' + join.view.table + '`';

    } else {

      Object.keys(join.view.pdt_view_deps_all).forEach(viewName => {
        let pdtName = `${item.structId}_${viewName}`;
        item.query_pdt_deps_all[pdtName] = 1;
      });

      let derivedSql = join.view.derived_table;

      if (join.view.permanent.match(ApRegex.TRUE())) {
        let permanentTable: string[] = [];

        permanentTable.push(`#standardSQL`);

        if (typeof join.view.udfs !== 'undefined' && join.view.udfs !== null) {

          join.view.udfs.forEach(udf => {

            permanentTable.push(item.udfs_dict[udf]);
          });
        }

        permanentTable.push(derivedSql);

        let permanentTableName = `${item.structId}_${join.view.name}`;

        item.query_pdt_deps[permanentTableName] = 1;
        item.query_pdt_deps_all[permanentTableName] = 1;

        // if (!usedViews[join.view.name]) {
        //   bqViews.push({
        //     bq_view_id: permanentTableName,
        //     sql: permanentTable,
        //     pdt_deps: Object.keys(join.view.pdt_view_deps).map(x => `${item.structId}_${x}`),
        //   });
        // }

        table = '`' + `${item.bqProject}.mprove_${item.projectId}.${permanentTableName}` + '`';

      } else {

        Object.keys(join.view.pdt_view_deps).forEach(viewName => {
          let pdtName = `${item.structId}_${viewName}`;
          item.query_pdt_deps[pdtName] = 1;
        });

        let derivedSqlStart = join.view.derived_table_start;

        derivedSqlStart = this.applyFilter(item, asName, derivedSqlStart);

        let derivedSqlStartArray = derivedSqlStart.split('\n');

        myWith.push(`  ${join.view.name}__${asName} AS (`);
        myWith.push(derivedSqlStartArray.map(s => `    ${s}`).join(`\n`));
        // myWith.push(`${derivedSqlStart}`);
        myWith.push(`  ),`);
        myWith.push(``);

        item.with_parts = Object.assign({}, item.with_parts, join.view.parts);

        if (typeof join.view.udfs !== 'undefined' && join.view.udfs !== null) {
          join.view.udfs.forEach(udf => {
            item.main_udfs[udf] = 1;
          });
        }

        table = `${join.view.name}__${asName}`;

      }
      // usedViews[join.view.name] = 1;
    }

    contents.push(`  FROM ${table}`);

    Object.keys(flats).forEach(flat => {
      contents.push(`    ${flat}`);
    });

    contents.push(`  ) as ${asName}`);

    if (asName !== item.model.from_as) {
      let sqlOnFinal = ApRegex.removeBracketsOnDoubles(join.sql_on_real);

      contents.push(`ON ${sqlOnFinal}`);
    }

    contents.push(``);

  });

  item.contents = contents;
  // item.bqViews = bqViews;
  item.with = myWith;

  return item;
}
