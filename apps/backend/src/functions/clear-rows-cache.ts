export function clearRowsCache(item: {
  processedRows: Row[];
  changedRowIds: string[];
  timezone: string;
  timeSpec: TimeSpecEnum;
  timeRangeFractionBrick: string;
}) {
  let {
    processedRows,
    changedRowIds,
    timezone,
    timeSpec,
    timeRangeFractionBrick
  } = item;

  // processedRows = processRowIds({
  //   rows: processedRows,
  //   targetRowIds: processedRows.map(pRow => pRow.rowId)
  // });

  processedRows.forEach(row => {
    if (
      changedRowIds.length === 0 ||
      row.deps.findIndex(dep => changedRowIds.indexOf(dep) > -1) > -1
    ) {
      if (
        row.rowType === RowTypeEnum.Formula ||
        row.rowType === RowTypeEnum.Metric
      ) {
        let currentRqIndex = row.rqs.findIndex(
          y =>
            y.fractionBrick === timeRangeFractionBrick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        row.rqs = [
          ...row.rqs.slice(0, currentRqIndex),
          ...row.rqs.slice(currentRqIndex + 1)
        ];

        if (row.rowType === RowTypeEnum.Metric) {
          row.parametersFiltersWithExcludedTime = [];

          row.records = [];
          row.mconfig = undefined;
          row.query = undefined;
        }
      }
    }
  });

  return processedRows;
}
