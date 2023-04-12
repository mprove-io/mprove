import { common } from '~backend/barrels/common';

export function clearRowsCache(item: {
  processedRows: common.Row[];
  changedRowIds: string[];
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFractionBrick: string;
}) {
  let {
    processedRows,
    changedRowIds,
    timezone,
    timeSpec,
    timeRangeFractionBrick
  } = item;

  let extraRowIds = [...changedRowIds];

  processedRows
    .filter(row => row.rowType === common.RowTypeEnum.Metric)
    .forEach(row => {
      // console.log('row.parametersFormulaDeps');
      // console.log(row.parametersFormulaDeps);

      let isMatch =
        (common.isDefined(row.parametersFormula) &&
          row.parametersFormulaDeps.findIndex(
            dep => changedRowIds.indexOf(dep) > -1
          ) > -1) ||
        (common.isUndefined(row.parametersFormula) &&
          row.parameters.filter(parameter => {
            let isPass =
              parameter.parameterType === common.ParameterTypeEnum.Formula &&
              parameter.formulaDeps.findIndex(
                dep => changedRowIds.indexOf(dep) > -1
              ) > -1;

            // console.log('parameter.formulaDeps');
            // console.log(parameter.formulaDeps);

            return isPass;
          }).length > 0);

      // console.log('isMatch');
      // console.log(isMatch);

      if (isMatch === true) {
        row.isCalculateParameters = true;
        row.parametersFiltersWithExcludedTime = [];

        let rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFractionBrick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        rq.kitId = undefined;
        rq.lastCalculatedTs = 0;

        row.records = [];
        row.mconfig = undefined;
        row.query = undefined;

        if (extraRowIds.indexOf(row.rowId) < 0) {
          extraRowIds.push(row.rowId);
        }
      }
    });

  processedRows.forEach(row => {
    if (
      row.rowType === common.RowTypeEnum.Formula &&
      row.formulaDeps.findIndex(dep => extraRowIds.indexOf(dep) > -1) > -1
    ) {
      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFractionBrick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      rq.kitId = undefined;
      rq.lastCalculatedTs = 0;
    }
  });

  return processedRows;
}
