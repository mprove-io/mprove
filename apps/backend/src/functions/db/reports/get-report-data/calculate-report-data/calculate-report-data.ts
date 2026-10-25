import { Result } from '@praha/byethrow';
import type pgPromise from 'pg-promise';
import type { KitTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeReportDataColumns } from '#backend/functions/db/reports/make-report-data-columns/make-report-data-columns';
import type { DbService } from '#backend/services/db/db.service';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { SOME_ROWS_HAVE_FORMULA_ERRORS } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { CalculateReportDataError } from '#common/types/backend/function-errors/calculate-report-data-error';
import type { MakeReportDataColumnsError } from '#common/types/backend/function-errors/make-report-data-columns-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ReportDataColumn } from '#common/types/backend/parts/report/report-data-column';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { RowRecord } from '#common/types/blockml/parts/report/row/row-record';
import type { Rq } from '#common/types/blockml/parts/report/row/rq';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { CycleGraph } from '#node-common/classes/cycle-graph/cycle-graph';

export async function calculateReportData(item: {
  report: ReportX;
  timezone: string;
  timeSpec: TimeSpec;
  timeRangeFraction: Fraction;
  db: DbService;
  calcDb: pgPromise.IDatabase<unknown>;
}): Result.ResultAsync<ReportX, CalculateReportDataError> {
  let { report, timeSpec, timeRangeFraction, timezone, db, calcDb } = item;

  // check for cycles
  let g: CycleGraph = new CycleGraph();

  // graph for toposort
  let gr: string[][] = [];

  report.rows.forEach(x => {
    x.formulaError = undefined;

    if (isDefined(x.formulaDeps) && x.formulaDeps.length > 0) {
      let wrongReferences: string[] = [];

      x.formulaDeps.forEach(dep => {
        if (report.rows.map(r => r.rowId).indexOf(dep) < 0) {
          wrongReferences.push(dep);
        }

        g.add(x.rowId, [dep]);

        gr.push([x.rowId, dep]);
      });

      if (wrongReferences.length > 0) {
        x.formulaError = `Formula references not valid rows: ${wrongReferences.join(', ')}`;
      }
    }
  });

  if (g.hasCycle() === true) {
    let cycles: any[] = g.getCycles();

    let cycledNames: string[] = cycles[0].map((c: any) => c.name);

    let cycledNamesStr: string = cycledNames.join(', ');

    report.rows
      .filter(k => cycledNames.includes(k.rowId))
      .forEach(x => {
        if (isUndefined(x.formulaError)) {
          x.formulaError = `Cycle in formula references of rows: ${cycledNamesStr}`;
        }
      });
  }

  let reportDataColumnsResult: Result.Result<
    ReportDataColumn[],
    MakeReportDataColumnsError
  > = makeReportDataColumns({
    report: report,
    timeSpec: timeSpec
  });

  if (Result.isFailure(reportDataColumnsResult)) {
    return reportDataColumnsResult;
  }

  let reportDataColumns: ReportDataColumn[] = reportDataColumnsResult.value;

  let topQueryData: any[] = [];

  let topQueryError: string;

  if (report.rows.some(x => isDefined(x.formulaError))) {
    topQueryError = SOME_ROWS_HAVE_FORMULA_ERRORS;
  } else {
    let timestampValues: number[] = reportDataColumns.map(
      x => x.fields['timestamp'] * 1000
    );

    let mainSelect: string[] = [
      `unnest(ARRAY[${timestampValues}]::bigint[]) AS timestamp`,
      ...report.rows
        .filter(row => row.rowType === 'metric')
        .map(row => {
          let values: any[] = reportDataColumns.map(r =>
            isDefined(r.fields[row.rowId]) ? r.fields[row.rowId] : 'NULL'
          );

          let str = `    unnest(ARRAY[${values}]::numeric[]) AS ${row.rowId}`;

          return str;
        })
    ];

    let mainSelectReady: string = mainSelect.join(',\n');

    let outerSelect: string[] = [
      `  main.timestamp as timestamp`,
      ...report.rows
        .filter(row => row.rowType === 'metric')
        .map(x => `  main.${x.rowId} AS ${x.rowId}`),
      ...report.rows
        .filter(row => row.rowType === 'formula')
        .map(row => {
          let newFormula = row.formula;

          let reg: RegExp = MyRegex.CAPTURE_ROW_REF();

          let r: RegExpExecArray;

          while ((r = reg.exec(newFormula))) {
            let reference = r[1];

            let targetRow: Row = report.rows.find(y => y.rowId === reference);

            let targetTo =
              targetRow.rowType === 'formula'
                ? targetRow.formula
                : targetRow.rowType === 'metric'
                  ? `main.${targetRow.rowId}`
                  : reference;

            newFormula =
              targetRow.rowType === 'metric'
                ? MyRegex.replaceRowIdsFinalNoPars(
                    newFormula,
                    reference,
                    targetTo
                  )
                : MyRegex.replaceRowIdsFinalAddPars(
                    newFormula,
                    reference,
                    targetTo
                  );
          }

          let str = `  ${newFormula} as ${row.rowId}`;

          return str;
        })
    ];

    let outerSelectReady: string = outerSelect.join(',\n');

    let querySql = `WITH main AS (
  SELECT
    ${mainSelectReady}
)
SELECT
${outerSelectReady}
FROM main;`;

    await calcDb
      .any(querySql)
      .then((data: any[]) => {
        topQueryData = data.map((r: any) => {
          Object.keys(r)
            .filter(y => y !== 'timestamp')
            .forEach(x => {
              r[x] = isDefined(r[x]) ? Number(r[x]) : undefined;
            });

          return r;
        });
      })
      .catch((errr: any) => {
        topQueryError = errr.message;
      });
  }

  let lastCalculatedTs: number = Number(Date.now().toString());

  let newKits: KitTab[] = [];

  report.rows
    .filter(row => row.rowType === 'metric' || row.rowType === 'formula')
    .forEach(row => {
      if (row.rowType === 'formula' && isDefined(row.formulaError)) {
        row.topQueryError = row.formulaError;

        row.records = reportDataColumns.map((y, index) => {
          let unixTimeZoned = y.fields['timestamp'];

          let record: RowRecord = {
            columnLabel: undefined,
            id: index + 1,
            key: unixTimeZoned,
            value: undefined,
            error: undefined
          };

          return record;
        });
      } else if (row.rowType === 'formula' && isDefined(topQueryError)) {
        row.topQueryError = topQueryError;

        row.records = reportDataColumns.map((y, index) => {
          let unixTimeZoned = y.fields['timestamp'];

          let record: RowRecord = {
            columnLabel: undefined,
            id: index + 1,
            key: unixTimeZoned,
            value: undefined,
            error: undefined
          };

          return record;
        });
      } else if (row.rowType === 'metric' && isDefined(topQueryError)) {
        row.topQueryError = topQueryError;

        row.records = reportDataColumns.map((y, index) => {
          let unixTimeZoned = y.fields['timestamp'];

          let record: RowRecord = {
            columnLabel: undefined,
            id: index + 1,
            key: unixTimeZoned,
            value: y.fields[row.rowId],
            error: undefined
          };

          return record;
        });
      } else if (isUndefined(topQueryError)) {
        row.topQueryError = undefined;

        row.records = topQueryData.map((y: any, index) => {
          let unixTimeZoned = y.timestamp / 1000;

          let record: RowRecord = {
            columnLabel: undefined,
            id: index + 1,
            key: unixTimeZoned,
            value: y[row.rowId.toLowerCase()],
            error: undefined
          };

          return record;
        });
      }

      let rq: Rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      if (row.rowType === 'formula') {
        rq.kitId = makeId();

        let newKit: KitTab = {
          structId: report.structId,
          kitId: rq.kitId,
          reportId: report.reportId,
          data: row.records,
          keyTag: undefined,
          serverTs: undefined
        };

        newKits.push(newKit);
      }

      rq.lastCalculatedTs = lastCalculatedTs;
    });

  if (newKits.length > 0) {
    let persistenceResult: Result.Result<void, WriteError> = await db.write({
      insert: {
        kits: newKits
      }
    });

    if (Result.isFailure(persistenceResult)) {
      return persistenceResult;
    }
  }

  return Result.succeed(report);
}
