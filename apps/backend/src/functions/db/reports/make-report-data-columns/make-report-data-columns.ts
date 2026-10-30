import { Result } from '@praha/byethrow';
import { format, fromUnixTime } from 'date-fns';
import dayjs from 'dayjs';
import { DateTime } from 'luxon';
import { getReportDataFieldSqlName } from '#backend/functions/db/reports/make-report-data-columns/get-report-data-field-sql-name/get-report-data-field-sql-name';
import { normalizeReportTimeValue } from '#backend/functions/db/reports/make-report-data-columns/normalize-report-time-value/normalize-report-time-value';
import { nodeFormatTsUnix } from '#backend/functions/ts/node-format-ts-unix/node-format-ts-unix';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { MakeReportDataColumnsError } from '#common/types/backend/function-errors/make-report-data-columns-error';
import type { ReportDataColumn } from '#common/types/backend/parts/report/report-data-column';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { Column } from '#common/types/blockml/parts/report/column';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { TimeSpec } from '#common/types/shared/time/timespec';

type IndexedReportColumn = {
  column: Column;
  index: number;
};

export function makeReportDataColumns(item: {
  report: ReportX;
  timeSpec: TimeSpec;
}): Result.Result<ReportDataColumn[], MakeReportDataColumnsError> {
  let { report, timeSpec } = item;

  let reportDataColumns: ReportDataColumn[] = [];

  report.rows
    .filter(
      row =>
        row.rowType === 'metric' &&
        row.mconfig.select.length > 0 &&
        isDefined(row.query?.data)
    )
    .forEach(row => {
      row.query.data =
        row.mconfig?.modelType === 'Malloy' &&
        row.query.connectionType === 'PostgreSQL'
          ? row.query.data
              .filter((x: any) => isDefined(x.row))
              .map((x: any) => {
                x.row = Object.keys(x.row).reduce((destination: any, key) => {
                  destination[key.toLowerCase()] = x.row[key];

                  return destination;
                }, {});

                return x;
              })
          : row.query.data.map((x: any) =>
              Object.keys(x).reduce((destination: any, key) => {
                destination[key.toLowerCase()] = x[key];

                return destination;
              }, {})
            );
    });

  if (timeSpec !== 'timestamps') {
    let indexedColumns: IndexedReportColumn[] = report.columns.map(
      (column, i) => ({ column: column, index: i })
    );

    let reportDataColumnsResult: Result.Result<
      ReportDataColumn[],
      MakeReportDataColumnsError
    > = Result.sequence(indexedColumns, indexedColumn => {
      let { column, index: i } = indexedColumn;

      let reportDataColumn: ReportDataColumn = {
        id: i,
        fields: {
          timestamp: column.columnId
        }
      };

      let rows: Row[] = report.rows.filter(
        row => row.rowType === 'metric' && row.mconfig.select.length > 0
      );

      let columnRowsResult: Result.Result<void[], MakeReportDataColumnsError> =
        Result.sequence(rows, row => {
          let timeFieldId: string = getReportDataFieldSqlName({
            row: row,
            selectIndex: 0
          });

          let fieldId: string = getReportDataFieldSqlName({
            row: row,
            selectIndex: 1
          });

          let dataRow: any;

          if (row.mconfig.modelType === 'Store') {
            dataRow = row.query?.data?.find(
              (r: any) => r[timeFieldId] === column.columnId
            );
          } else {
            let tsDate: Date = fromUnixTime(column.columnId);

            let zonedDate: DateTime = DateTime.fromJSDate(tsDate, {
              zone: 'utc'
            }).setZone(row.mconfig.timezone);

            if (!zonedDate.isValid) {
              return Result.fail({
                code: 'BACKEND_DATE_CONVERSION_FAILED'
              });
            }

            let offsetMs = zonedDate.offset * 60 * 1000;

            let inverseOffsetMs = -offsetMs;

            let inverseDate: Date = new Date(
              tsDate.getTime() + inverseOffsetMs
            );

            let inverseZonedDate: DateTime = DateTime.fromJSDate(inverseDate, {
              zone: 'utc'
            });

            let zonedTimeValue: string = inverseZonedDate.toFormat(
              'yyyy-MM-dd HH:mm:ss'
            );

            let timeValue: string =
              row.mconfig?.modelType === 'Malloy'
                ? zonedTimeValue
                : timeSpec === 'years'
                  ? format(tsDate, 'yyyy')
                  : timeSpec === 'quarters'
                    ? format(tsDate, 'yyyy-MM')
                    : timeSpec === 'months'
                      ? format(tsDate, 'yyyy-MM')
                      : timeSpec === 'weeks'
                        ? format(tsDate, 'yyyy-MM-dd')
                        : timeSpec === 'days'
                          ? format(tsDate, 'yyyy-MM-dd')
                          : timeSpec === 'hours'
                            ? format(tsDate, 'yyyy-MM-dd HH')
                            : timeSpec === 'minutes'
                              ? format(tsDate, 'yyyy-MM-dd HH:mm')
                              : undefined;

            dataRow =
              row.mconfig?.modelType === 'Malloy' &&
              row.query.connectionType === 'PostgreSQL'
                ? row.query?.data?.find(
                    (r: any) =>
                      normalizeReportTimeValue({ value: timeValue }) ===
                      normalizeReportTimeValue({
                        value: r.row?.[timeFieldId]?.toString()
                      })
                  )?.row
                : row.query?.data?.find(
                    (r: any) =>
                      normalizeReportTimeValue({ value: timeValue }) ===
                      normalizeReportTimeValue({
                        value: r[timeFieldId]?.toString()
                      })
                  );
          }

          if (isDefined(dataRow)) {
            reportDataColumn.fields[row.rowId] = isUndefined(dataRow[fieldId])
              ? undefined
              : isNaN(dataRow[fieldId]) === false
                ? Number(dataRow[fieldId])
                : dataRow[fieldId];
          }

          return Result.succeed();
        });

      if (Result.isFailure(columnRowsResult)) {
        return columnRowsResult;
      }

      return Result.succeed(reportDataColumn);
    });

    if (Result.isFailure(reportDataColumnsResult)) {
      return reportDataColumnsResult;
    }

    reportDataColumns = reportDataColumnsResult.value;
  } else {
    report.columns = [];

    report.rows
      .filter(row => row.rowType === 'metric' && row.mconfig.select.length > 0)
      .forEach((row: Row) => {
        let timeFieldId: string = getReportDataFieldSqlName({
          row: row,
          selectIndex: 0
        });

        let fieldId: string = getReportDataFieldSqlName({
          row: row,
          selectIndex: 1
        });

        (row.query?.data as any[])?.forEach(x => {
          let dataRow =
            row.mconfig?.modelType === 'Malloy' &&
            row.query.connectionType === 'PostgreSQL'
              ? x.row
              : x;

          let timestampString: string = dataRow[timeFieldId]?.toString();

          let columnId: number = dayjs(timestampString).valueOf() / 1000;

          let dataValue: any = isUndefined(dataRow[fieldId])
            ? undefined
            : isNaN(dataRow[fieldId]) === false
              ? Number(dataRow[fieldId])
              : dataRow[fieldId];

          let reportDataColumn: ReportDataColumn = reportDataColumns.find(
            x => x.fields.timestamp === columnId
          );

          if (isUndefined(reportDataColumn)) {
            reportDataColumn = {
              id: undefined,
              fields: {
                timestamp: columnId,
                [row.rowId]: dataValue
              }
            };

            reportDataColumns.push(reportDataColumn);
          } else {
            reportDataColumn.fields[row.rowId] = dataValue;
          }

          let reportColumn: Column = report.columns.find(
            x => x.columnId === columnId
          );

          if (isUndefined(reportColumn)) {
            reportColumn = {
              columnId: columnId,
              label: nodeFormatTsUnix({
                timeSpec: timeSpec,
                unixTimeZoned: columnId
              })
            };

            report.columns.push(reportColumn);
          }
        });
      });

    report.columns.sort((a, b) =>
      a.columnId > b.columnId ? 1 : b.columnId > a.columnId ? -1 : 0
    );

    reportDataColumns.sort((a, b) =>
      a.fields.timestamp > b.fields.timestamp
        ? 1
        : b.fields.timestamp > a.fields.timestamp
          ? -1
          : 0
    );

    reportDataColumns = reportDataColumns.map((x, i) => {
      x.id = i;

      return x;
    });
  }

  return Result.succeed(reportDataColumns);
}
