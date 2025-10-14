import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format, fromUnixTime } from 'date-fns';
import { DateTime } from 'luxon';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { KitTab } from '~backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTs } from '~backend/functions/make-ts';
import {
  DOUBLE_UNDERSCORE,
  SOME_ROWS_HAVE_FORMULA_ERRORS
} from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { ReportDataColumn } from '~common/interfaces/backend/report-data-column';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { Row } from '~common/interfaces/blockml/row';
import { RowRecord } from '~common/interfaces/blockml/row-record';
import { MyRegex } from '~common/models/my-regex';
import { ServerError } from '~common/models/server-error';
import { nodeFormatTsUnix } from '~node-common/functions/node-format-ts-unix';

let Graph = require('tarjan-graph');
let toposort = require('toposort');
let retry = require('async-retry');
let dayjs = require('dayjs');

interface XColumn {
  id: string;
  xDeps: string[];
  input: string;
  inputSub: string;
  outputValue: string;
  outputError: string;
}

@Injectable()
export class DocService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async calculateData(item: {
    report: ReportX;
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFraction: Fraction;
    traceId: string;
  }) {
    let { report, timeSpec, timeRangeFraction, timezone, traceId } = item;

    // check for cycles - tarjan graph
    let g = new Graph();
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
          x.formulaError = `Formula references not valid rows: ${wrongReferences.join(
            ', '
          )}`;
        }
      }
    });

    let cycledNames: string[] = [];

    if (g.hasCycle() === true) {
      let cycles: any[] = g.getCycles();

      cycledNames = cycles[0].map((c: any) => c.name);

      let cycledNamesStr = cycledNames.join(', ');

      report.rows
        .filter(k => cycledNames.indexOf(k.rowId) > -1)
        .forEach(x => {
          if (isUndefined(x.formulaError)) {
            x.formulaError = `Cycle in formula references of rows: ${cycledNamesStr}`;
          }
          return x;
        });
    }

    let reportDataColumns = this.makeReportDataColumns({
      report: report,
      timeSpec: timeSpec
    });

    let topQueryData: any[] = [];
    let topQueryError: any;

    if (report.rows.filter(x => isDefined(x.formulaError)).length > 0) {
      topQueryError = SOME_ROWS_HAVE_FORMULA_ERRORS;
    } else {
      let cn: pg.IConnectionParameters<pg.IClient> = {
        host: this.cs.get<BackendConfig['calcPostgresHost']>(
          'calcPostgresHost'
        ),
        port: this.cs.get<BackendConfig['calcPostgresPort']>(
          'calcPostgresPort'
        ),
        user: this.cs.get<BackendConfig['calcPostgresUsername']>(
          'calcPostgresUsername'
        ),
        password: this.cs.get<BackendConfig['calcPostgresPassword']>(
          'calcPostgresPassword'
        ),
        ssl: false
      };

      let timestampValues = reportDataColumns.map(
        x => x.fields['timestamp'] * 1000
      );

      // console.log(timestampValues);

      let mainSelect = [
        `unnest(ARRAY[${timestampValues}]::bigint[]) AS timestamp`,
        ...report.rows
          .filter(row => row.rowType === RowTypeEnum.Metric)
          .map(row => {
            let values = reportDataColumns.map(r =>
              isDefined(r.fields[row.rowId]) ? r.fields[row.rowId] : 'NULL'
            );
            let str = `    unnest(ARRAY[${values}]::numeric[]) AS ${row.rowId}`;
            return str;
          })
      ];

      let mainSelectReady = mainSelect.join(',\n');

      let outerSelect = [
        `  main.timestamp as timestamp`,
        ...report.rows
          .filter(row => row.rowType === RowTypeEnum.Metric)
          .map(x => `  main.${x.rowId} AS ${x.rowId}`),
        ...report.rows
          .filter(row => row.rowType === RowTypeEnum.Formula)
          .map(row => {
            let newFormula = row.formula;
            let reg = MyRegex.CAPTURE_ROW_REF();
            let r;

            while ((r = reg.exec(newFormula))) {
              let reference = r[1];

              let targetRow = report.rows.find(y => y.rowId === reference);

              let targetTo =
                targetRow.rowType === RowTypeEnum.Formula
                  ? targetRow.formula
                  : targetRow.rowType === RowTypeEnum.Metric
                    ? `main.${targetRow.rowId}`
                    : reference;

              newFormula =
                targetRow.rowType === RowTypeEnum.Metric
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

      let outerSelectReady = outerSelect.join(',\n');

      let querySql = `WITH main AS (
  SELECT
    ${mainSelectReady}
)
SELECT
${outerSelectReady}
FROM main;`;

      // console.log('querySql:');
      // console.log(querySql);

      let pgp = pgPromise({ noWarnings: true });
      let pgDb = pgp(cn);

      await pgDb
        .any(querySql)
        .then(async (data: any) => {
          topQueryData = data.map((r: any) => {
            Object.keys(r)
              .filter(y => y !== 'timestamp')
              .forEach(x => {
                r[x] = isDefined(r[x]) ? Number(r[x]) : undefined;
              });

            return r;
          });
        })
        .catch(async (errr: any) => {
          topQueryError = errr.message;
        });

      // console.log('topQueryData');
      // console.log(topQueryData);
    }

    let lastCalculatedTs = Number(makeTs());

    let newKits: KitTab[] = [];

    report.rows
      .filter(
        row =>
          row.rowType === RowTypeEnum.Metric ||
          row.rowType === RowTypeEnum.Formula
      )
      .forEach(row => {
        if (
          row.rowType === RowTypeEnum.Formula &&
          isDefined(row.formulaError)
        ) {
          row.topQueryError = row.formulaError;
          row.records = reportDataColumns.map((y: any, index) => {
            let unixTimeZoned = y.fields['timestamp'];
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: RowRecord = {
              columnLabel: undefined,
              id: index + 1,
              key: unixTimeZoned,
              // tsUTC: tsUTC,
              value: undefined,
              error: undefined
            };

            return record;
          });
        } else if (
          row.rowType === RowTypeEnum.Formula &&
          isDefined(topQueryError)
        ) {
          row.topQueryError = topQueryError;
          row.records = reportDataColumns.map((y: any, index) => {
            let unixTimeZoned = y.fields['timestamp'];
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: RowRecord = {
              columnLabel: undefined,
              id: index + 1,
              key: unixTimeZoned,
              // tsUTC: tsUTC,
              value: undefined,
              error: undefined
            };

            return record;
          });
        } else if (
          row.rowType === RowTypeEnum.Metric &&
          isDefined(topQueryError)
        ) {
          row.topQueryError = topQueryError;

          row.records = reportDataColumns.map((y: any, index) => {
            let unixTimeZoned = y.fields['timestamp'];
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: RowRecord = {
              columnLabel: undefined,
              id: index + 1,
              key: unixTimeZoned,
              // tsUTC: tsUTC,
              value: y.fields[row.rowId],
              error: undefined
            };

            return record;
          });
        } else if (isUndefined(topQueryError)) {
          row.topQueryError = undefined;

          row.records = topQueryData.map((y: any, index) => {
            let unixTimeZoned = y.timestamp / 1000;
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: RowRecord = {
              columnLabel: undefined,
              id: index + 1,
              key: unixTimeZoned,
              // tsUTC: tsUTC,
              value: y[row.rowId.toLowerCase()],
              error: undefined
            };

            return record;
          });
        }

        let rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (row.rowType === RowTypeEnum.Formula) {
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
      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insert: {
                  kits: newKits
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    return report;
  }

  makeReportDataColumns(item: {
    report: ReportX;
    timeSpec: TimeSpecEnum;
  }) {
    let { report, timeSpec } = item;

    let reportDataColumns: ReportDataColumn[] = [];

    report.rows
      .filter(
        row =>
          row.rowType === RowTypeEnum.Metric &&
          row.mconfig.select.length > 0 &&
          isDefined(row.query?.data)
      )
      .forEach(row => {
        row.query.data =
          row.mconfig?.modelType === ModelTypeEnum.Malloy &&
          row.query.connectionType === ConnectionTypeEnum.PostgreSQL
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

    if (timeSpec !== TimeSpecEnum.Timestamps) {
      reportDataColumns = report.columns.map((column, i) => {
        let reportDataColumn: ReportDataColumn = {
          id: i,
          fields: {
            timestamp: column.columnId
          }
        };

        report.rows
          .filter(
            row =>
              row.rowType === RowTypeEnum.Metric &&
              row.mconfig.select.length > 0
          )
          .forEach((row: Row) => {
            let timeFieldId =
              row.mconfig?.modelType === ModelTypeEnum.Malloy
                ? row.mconfig?.select[0].split('.').join(DOUBLE_UNDERSCORE)
                : row.mconfig?.select[0].split('.').join('_').toLowerCase();

            let fieldId =
              row.mconfig?.modelType === ModelTypeEnum.Malloy
                ? row.mconfig?.select[1].split('.').join(DOUBLE_UNDERSCORE)
                : row.mconfig?.select[1].split('.').join('_').toLowerCase();

            let dataRow;

            if (row.mconfig.modelType === ModelTypeEnum.Store) {
              dataRow = row.query?.data?.find(
                (r: any) => r[timeFieldId] === column.columnId
              );
            } else {
              let tsDate = fromUnixTime(column.columnId);

              // console.log('tsDate.toISOString().slice(0, 19)');
              // console.log(tsDate.toISOString().slice(0, 19));

              let zonedDate = DateTime.fromJSDate(tsDate, {
                zone: 'utc'
              }).setZone(row.mconfig.timezone);

              if (!zonedDate.isValid) {
                throw new ServerError({
                  message: ErEnum.BACKEND_DATE_CONVERSION_FAILED
                });
              }

              let offsetMs = zonedDate.offset * 60 * 1000;

              let inverseOffsetMs = -offsetMs;

              let inverseDate = new Date(tsDate.getTime() + inverseOffsetMs);

              let inverseZonedDate = DateTime.fromJSDate(inverseDate, {
                zone: 'utc'
              });

              // let zonedTimeValue = tsDate.toISOString().slice(0, 19)
              let zonedTimeValue = inverseZonedDate.toFormat(
                'yyyy-MM-dd HH:mm:ss'
              );

              // console.log('zonedTimeValue');
              // console.log(zonedTimeValue);

              let timeValue =
                row.mconfig?.modelType === ModelTypeEnum.Malloy
                  ? zonedTimeValue
                  : timeSpec === TimeSpecEnum.Years
                    ? format(tsDate, 'yyyy')
                    : timeSpec === TimeSpecEnum.Quarters
                      ? format(tsDate, 'yyyy-MM')
                      : timeSpec === TimeSpecEnum.Months
                        ? format(tsDate, 'yyyy-MM')
                        : timeSpec === TimeSpecEnum.Weeks
                          ? format(tsDate, 'yyyy-MM-dd')
                          : timeSpec === TimeSpecEnum.Days
                            ? format(tsDate, 'yyyy-MM-dd')
                            : timeSpec === TimeSpecEnum.Hours
                              ? format(tsDate, 'yyyy-MM-dd HH')
                              : timeSpec === TimeSpecEnum.Minutes
                                ? format(tsDate, 'yyyy-MM-dd HH:mm')
                                : // : timeSpec === TimeSpecEnum.Timestamps
                                  // ? format(tsDate, 'yyyy-MM-dd HH:mm:ss.SSS')
                                  undefined;

              let normalizeTimeValue = (v: string) => {
                const match = v?.match(
                  /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d{3})?(?: UTC|Z)?$/
                );
                return match
                  ? `${match[1]}T${match[2]}${match[3] || '.000'}`
                  : null;
              };

              dataRow =
                row.mconfig?.modelType === ModelTypeEnum.Malloy &&
                row.query.connectionType === ConnectionTypeEnum.PostgreSQL
                  ? row.query?.data?.find(
                      (r: any) =>
                        normalizeTimeValue(timeValue) ===
                        normalizeTimeValue(r.row?.[timeFieldId]?.toString())
                    )?.row
                  : row.query?.data?.find(
                      (r: any) =>
                        normalizeTimeValue(timeValue) ===
                        normalizeTimeValue(r[timeFieldId]?.toString())
                    );
            }

            if (isDefined(dataRow)) {
              reportDataColumn.fields[row.rowId] = isUndefined(dataRow[fieldId])
                ? undefined
                : isNaN(dataRow[fieldId]) === false
                  ? Number(dataRow[fieldId])
                  : dataRow[fieldId];
            }
          });

        return reportDataColumn;
      });
    } else {
      report.columns = [];

      report.rows
        .filter(
          row =>
            row.rowType === RowTypeEnum.Metric && row.mconfig.select.length > 0
        )
        .forEach((row: Row) => {
          let timeFieldId =
            row.mconfig?.modelType === ModelTypeEnum.Malloy
              ? row.mconfig?.select[0].split('.').join(DOUBLE_UNDERSCORE)
              : row.mconfig?.select[0].split('.').join('_').toLowerCase();

          let fieldId =
            row.mconfig?.modelType === ModelTypeEnum.Malloy
              ? row.mconfig?.select[1].split('.').join(DOUBLE_UNDERSCORE)
              : row.mconfig?.select[1].split('.').join('_').toLowerCase();

          (row.query?.data as any[])?.forEach(x => {
            let dataRow =
              row.mconfig?.modelType === ModelTypeEnum.Malloy &&
              row.query.connectionType === ConnectionTypeEnum.PostgreSQL
                ? x.row
                : x;

            let timestampString = dataRow[timeFieldId]?.toString();

            let columnId = dayjs(timestampString).valueOf() / 1000;

            let dataValue = isUndefined(dataRow[fieldId])
              ? undefined
              : isNaN(dataRow[fieldId]) === false
                ? Number(dataRow[fieldId])
                : dataRow[fieldId];

            let reportDataColumn = reportDataColumns.find(
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

            let reportColumn = report.columns.find(
              x => x.columnId === columnId
            );

            if (isUndefined(reportColumn)) {
              reportColumn = {
                columnId: columnId,
                // tsUTC: undefined,
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

    return reportDataColumns;
  }
}
