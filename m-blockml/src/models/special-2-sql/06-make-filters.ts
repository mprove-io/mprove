import { api } from '~/barrels/api';
import { constants } from '~/barrels/constants';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { processFilter } from '~/models/special/process-filter';

let func = enums.FuncEnum.MakeFilters;

export function makeFilters(item: {
  joins: interfaces.VarsSql['joins'];
  filters: interfaces.VarsSql['filters'];
  weekStart: interfaces.VarsSql['weekStart'];
  processedFields: interfaces.VarsSql['processedFields'];
  timezone: interfaces.VarsSql['timezone'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let {
    joins,
    filters,
    weekStart,
    processedFields,
    timezone,
    varsSqlSteps,
    model
  } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    joins,
    filters,
    weekStart,
    processedFields,
    timezone
  });

  let filtersFractions: interfaces.VarsSql['filtersFractions'] = {};
  let whereCalc: interfaces.VarsSql['whereCalc'] = {};
  let havingMain: interfaces.VarsSql['havingMain'] = {};
  let whereMain: interfaces.VarsSql['whereMain'] = {};
  let filterFieldsConditions: interfaces.VarsSql['filterFieldsConditions'] = {};

  // prepare model and view filters defaults that is not in report default
  // they will populate fractions
  let untouchedFilters: interfaces.FilterBricksDictionary = {};

  Object.keys(model.filters).forEach(modelFilter => {
    let modelFilterName = `${constants.MF}.${modelFilter}`;

    if (helper.isUndefined(filters[modelFilterName])) {
      untouchedFilters[modelFilterName] = model.filters[modelFilter];
    }
  });

  model.joinsSorted
    .filter(x => helper.isDefined(joins[x]))
    .forEach(asName => {
      let join = model.joins.find(j => j.as === asName);

      Object.keys(join.view.filters).forEach(viewFilter => {
        let viewFilterName = `${asName}.${viewFilter}`;

        if (helper.isUndefined(filters[viewFilterName])) {
          untouchedFilters[viewFilterName] = join.view.filters[viewFilter];
        }
      });
    });

  let allFilters = Object.assign({}, untouchedFilters, filters);

  Object.keys(allFilters).forEach(element => {
    let filterBricks = allFilters[element];

    let r = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);
    let asName = r[1];
    let fieldName = r[2];

    let sqlTimestampSelect: string;

    let field =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    if (field.result === api.FieldResultEnum.Ts) {
      if (field.fieldClass === api.FieldClassEnum.Filter) {
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

    let proc: string;

    if (field.fieldClass === api.FieldClassEnum.Measure) {
      if (model.connection.type === api.ConnectionTypeEnum.BigQuery) {
        proc = `${asName}_${fieldName}`;
      } else if (model.connection.type === api.ConnectionTypeEnum.PostgreSQL) {
        proc = processedFields[element];
      }
    } else if (field.fieldClass === api.FieldClassEnum.Filter) {
      proc = constants.MPROVE_FILTER;
    } else {
      proc = processedFields[element];
    }

    filtersFractions[element] = [];

    processFilter({
      result: field.result,
      filterBricks: filterBricks,
      proc: proc,
      weekStart: weekStart,
      connection: model.connection,
      timezone: timezone,
      sqlTsSelect: sqlTimestampSelect,
      ORs: myORs,
      NOTs: myNOTs,
      INs: myINs,
      NOTINs: myNOTINs,
      fractions: filtersFractions[element]
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

    if (field.fieldClass === api.FieldClassEnum.Calculation) {
      whereCalc[element] = conds;
    } else if (field.fieldClass === api.FieldClassEnum.Measure) {
      havingMain[element] = conds;
    } else if (field.fieldClass === api.FieldClassEnum.Dimension) {
      whereMain[element] = conds;
    } else if (field.fieldClass === api.FieldClassEnum.Filter) {
      filterFieldsConditions[element] = conds;
    }
  });

  let varsOutput: interfaces.VarsSql = {
    filtersFractions,
    whereCalc,
    havingMain,
    whereMain,
    filterFieldsConditions
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
