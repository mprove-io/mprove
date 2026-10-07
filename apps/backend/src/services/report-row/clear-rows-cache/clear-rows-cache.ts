import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function clearRowsCache(item: {
  processedRows: Row[];
  changedRowIds: string[];
  timezone: string;
  timeSpec: TimeSpec;
  timeRangeFractionBrick: string;
}) {
  let {
    processedRows,
    changedRowIds,
    timezone,
    timeSpec,
    timeRangeFractionBrick
  } = item;

  processedRows.forEach(row => {
    if (
      changedRowIds.length === 0 ||
      row.deps.findIndex(dep => changedRowIds.indexOf(dep) > -1) > -1
    ) {
      if (row.rowType === 'formula' || row.rowType === 'metric') {
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

        if (row.rowType === 'metric') {
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
