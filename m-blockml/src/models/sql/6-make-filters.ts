import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { processFilter } from '../special/process-filter';

export function makeFilters(item: interfaces.VarsSql) {
  // prepare model and view filters defaults that is not in report default
  let untouchedFilters: { [s: string]: string[] } = {};

  Object.keys(item.model.filters).forEach(modelFilter => {
    let modelFilterName = `${constants.MF}.${modelFilter}`;

    if (helper.isUndefined(item.filters[modelFilterName])) {
      untouchedFilters[modelFilterName] = item.model.filters[modelFilter];
    }
  });

  item.model.joinsSorted.forEach(asName => {
    if (!item.joins[asName]) {
      return;
    }

    let join = item.model.joins.find(j => j.as === asName);

    Object.keys(join.view.filters).forEach(viewFilter => {
      let viewFilterName = `${asName}.${viewFilter}`;

      if (helper.isUndefined(item.filters[viewFilterName])) {
        untouchedFilters[viewFilterName] = join.view.filters[viewFilter];
      }
    });
  });

  [...Object.keys(item.filters), ...Object.keys(untouchedFilters)].forEach(
    element => {
      let r = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
      let asName = r[1];
      let fieldName = r[2];

      let sqlTimestampSelect: string;

      let field =
        asName === constants.MF
          ? item.model.fields.find(mField => mField.name === fieldName)
          : item.model.joins
              .find(j => j.as === asName)
              .view.fields.find(vField => vField.name === fieldName);

      if (field.result === enums.FieldAnyResultEnum.Ts) {
        if (field.fieldClass === enums.FieldClassEnum.Filter) {
          sqlTimestampSelect = constants.MPROVE_FILTER;
        } else if (asName === constants.MF) {
          // remove ${ } on doubles (no singles exists in _real of model dimensions)
          // ${a.city} + ${b.country}   >>>   a.city + b.country
          sqlTimestampSelect = api.MyRegex.removeBracketsOnDoubles(
            field.sqlTimestampReal
          );
        } else {
          sqlTimestampSelect = `${asName}.${field.sqlTimestampName}`;
        }
      }

      let myORs: string[] = [];
      let myNOTs: string[] = [];
      let myINs: string[] = [];
      let myNOTINs: string[] = [];

      let proc;

      if (field.fieldClass === enums.FieldClassEnum.Measure) {
        if (item.model.connection.type === api.ConnectionTypeEnum.BigQuery) {
          proc = `${asName}_${fieldName}`;
        } else if (
          item.model.connection.type === api.ConnectionTypeEnum.PostgreSQL
        ) {
          proc = item.processedFields[element];
        }
      } else if (field.fieldClass === enums.FieldClassEnum.Filter) {
        proc = constants.MPROVE_FILTER;
      } else {
        proc = item.processedFields[element];
      }

      let filterBricks = item.filters[element]
        ? item.filters[element]
        : untouchedFilters[element];

      item.filtersFractions[element] = [];

      let fractions = item.filtersFractions[element];

      let p = processFilter({
        result: field.result,
        filterBricks: filterBricks,
        proc: proc,
        weekStart: item.weekStart,
        connection: item.model.connection,
        timezone: item.timezone,
        sqlTsSelect: sqlTimestampSelect,
        ORs: myORs,
        NOTs: myNOTs,
        INs: myINs,
        NOTINs: myNOTINs,
        fractions: fractions
      });

      // unique
      myINs = [...new Set([...myINs])];
      myNOTINs = [...new Set([...myNOTINs])];

      let inValues = myINs.join(',');

      if (myINs.length === 1) {
        myORs.push(`${proc} = ${inValues}`);
      } else if (myINs.length > 1) {
        myORs.push(`${proc} IN (${inValues})`);
      }

      let notInValues = myNOTINs.join(',');

      if (myNOTINs.length === 1) {
        myNOTs.push(`NOT (${proc} = ${notInValues})`);
      } else if (myNOTINs.length > 1) {
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

      if (field.fieldClass === enums.FieldClassEnum.Calculation) {
        item.whereCalc[element] = conds;
      } else if (field.fieldClass === enums.FieldClassEnum.Measure) {
        item.havingMain[element] = conds;
      } else if (field.fieldClass === enums.FieldClassEnum.Dimension) {
        item.whereMain[element] = conds;
      } else if (field.fieldClass === enums.FieldClassEnum.Filter) {
        if (item.filters[element]) {
          item.filtersConditions[element] = conds;
        } else {
          item.untouchedFiltersConditions[element] = conds;
        }
      }
    }
  );

  return item;
}
