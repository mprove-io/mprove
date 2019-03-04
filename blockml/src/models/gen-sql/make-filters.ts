import { ApRegex } from '../../barrels/am-regex';
import { barProcessFilter } from '../../barrels/bar-process-filter';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeFilters(item: interfaces.Vars) {
  // prepare model and view filters defaults that is not in report default
  let untouchedFilters: { [s: string]: string[] } = {};

  Object.keys(item.model.filters).forEach(modelFilter => {
    let modelFilterName = `mf.${modelFilter}`;

    if (
      typeof item.filters[modelFilterName] === 'undefined' ||
      item.filters[modelFilterName] === null
    ) {
      untouchedFilters[modelFilterName] = item.model.filters[modelFilter];
    }
  });

  item.model.joins_sorted.forEach(asName => {
    if (!item.joins[asName]) {
      return;
    }

    let join = item.model.joins.find(j => j.as === asName);

    Object.keys(join.view.filters).forEach(viewFilter => {
      let viewFilterName = `${asName}.${viewFilter}`;

      if (
        typeof item.filters[viewFilterName] === 'undefined' ||
        item.filters[viewFilterName] === null
      ) {
        untouchedFilters[viewFilterName] = join.view.filters[viewFilter];
      }
    });
  });

  [...Object.keys(item.filters), ...Object.keys(untouchedFilters)].forEach(
    element => {
      let r = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
      let asName = r[1];
      let fieldName = r[2];

      let sqlTimestampSelect: string;

      let field =
        asName === 'mf'
          ? item.model.fields.find(mField => mField.name === fieldName)
          : item.model.joins
              .find(j => j.as === asName)
              .view.fields.find(vField => vField.name === fieldName);

      if (field.result === enums.FieldExtResultEnum.Ts) {
        if (field.field_class === enums.FieldClassEnum.Filter) {
          sqlTimestampSelect = `mproveFilter`;
        } else if (asName === 'mf') {
          // remove ${ } on doubles (no singles exists in _real of model dimensions)
          // ${a.city} + ${b.country}   >>>   a.city + b.country
          sqlTimestampSelect = ApRegex.removeBracketsOnDoubles(
            field.sql_timestamp_real
          );
        } else {
          sqlTimestampSelect = `${asName}.${field.sql_timestamp_name}`;
        }
      }

      let myORs: string[] = [];
      let myNOTs: string[] = [];
      let myIN: string[] = [];
      let myNOTIN: string[] = [];

      let proc =
        field.field_class === enums.FieldClassEnum.Measure
          ? `${asName}_${fieldName}`
          : field.field_class === enums.FieldClassEnum.Filter
          ? `mproveFilter`
          : item.processed_fields[element];

      let filterBricks = item.filters[element]
        ? item.filters[element]
        : untouchedFilters[element];

      item.filters_fractions[element] = [];

      let fractions = item.filters_fractions[element];

      let p = barProcessFilter.processFilter({
        result: field.result,
        filter_bricks: filterBricks,
        proc: proc,
        weekStart: item.weekStart,
        timezone: item.timezone,
        sqlTimestampSelect: sqlTimestampSelect,
        ORs: myORs,
        NOTs: myNOTs,
        IN: myIN,
        NOTIN: myNOTIN,
        fractions: fractions
      });

      // unique
      myIN = [...new Set([...myIN])];
      myNOTIN = [...new Set([...myNOTIN])];

      let inValues = myIN.join(',');

      if (myIN.length === 1) {
        myORs.push(`${proc} = ${inValues}`);
      } else if (myIN.length > 1) {
        myORs.push(`${proc} IN (${inValues})`);
      }

      let notInValues = myNOTIN.join(',');

      if (myNOTIN.length === 1) {
        myNOTs.push(`NOT (${proc} = ${notInValues})`);
      } else if (myNOTIN.length > 1) {
        myNOTs.push(`NOT (${proc} IN (${notInValues}))`);
      }

      let conds: string[] = [];

      let con;
      let conStart;

      let notCon;
      let notConStart;

      // aa
      if (myORs.length === 0 && myNOTs.length === 0) {
        //  not interested
        // ab
      } else if (myORs.length === 0 && myNOTs.length === 1) {
        notCon = myNOTs.shift();
        conds.push(`  (${notCon})`);

        // ba
      } else if (myORs.length === 1 && myNOTs.length === 0) {
        con = myORs.shift();
        conds.push(`  (${con})`);

        // ac
      } else if (myORs.length === 0 && myNOTs.length > 1) {
        notConStart = myNOTs.shift();
        conds.push(`  (${notConStart}`);

        while (myNOTs.length > 0) {
          notCon = myNOTs.shift();

          if (myNOTs.length > 0) {
            conds.push(`  AND ${notCon}`);
          } else {
            conds.push(`  AND ${notCon})`);
          }
        }

        // ca
      } else if (myORs.length > 1 && myNOTs.length === 0) {
        conStart = myORs.shift();
        conds.push(`  (${conStart}`);

        while (myORs.length > 0) {
          con = myORs.shift();

          if (myORs.length > 0) {
            conds.push(`  OR ${con}`);
          } else {
            conds.push(`  OR ${con})`);
          }
        }

        // bb
        // bc
      } else if (myORs.length === 1 && myNOTs.length >= 1) {
        conStart = myORs.shift();

        conds.push(`  (${conStart}`);

        while (myNOTs.length > 0) {
          notCon = myNOTs.shift();

          if (myNOTs.length > 0) {
            conds.push(`  AND ${notCon}`);
          } else {
            conds.push(`  AND ${notCon})`);
          }
        }

        // cb
        // cc
      } else if (myORs.length > 1 && myNOTs.length >= 1) {
        conStart = myORs.shift();

        conds.push(`  ((${conStart}`);

        while (myORs.length > 0) {
          con = myORs.shift();

          if (myORs.length > 0) {
            conds.push(`  OR ${con}`);
          } else {
            conds.push(`  OR ${con})`);
          }
        }

        while (myNOTs.length > 0) {
          notCon = myNOTs.shift();

          if (myNOTs.length > 0) {
            conds.push(`  AND ${notCon}`);
          } else {
            conds.push(`  AND ${notCon})`);
          }
        }
      }

      if (field.field_class === enums.FieldClassEnum.Calculation) {
        item.where_calc[element] = conds;
      } else if (field.field_class === enums.FieldClassEnum.Measure) {
        item.having_main[element] = conds;
      } else if (field.field_class === enums.FieldClassEnum.Dimension) {
        item.where_main[element] = conds;
      } else if (field.field_class === enums.FieldClassEnum.Filter) {
        if (item.filters[element]) {
          item.filters_conditions[element] = conds;
        } else {
          item.untouched_filters_conditions[element] = conds;
        }
      }
    }
  );

  return item;
}
