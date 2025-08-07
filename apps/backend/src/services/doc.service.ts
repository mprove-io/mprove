import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format, fromUnixTime } from 'date-fns';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { DOUBLE_UNDERSCORE } from '~common/_index';
import { RabbitService } from './rabbit.service';
import { UserCodeService } from './user-code.service';

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
    private rabbitService: RabbitService,
    private userCodeService: UserCodeService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async calculateData(item: {
    report: common.ReportX;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    traceId: string;
  }) {
    let { report, timeSpec, timeRangeFraction, timezone, traceId } = item;

    // check for cycles - tarjan graph
    let g = new Graph();
    // graph for toposort
    let gr: string[][] = [];

    report.rows.forEach(x => {
      x.formulaError = undefined;

      if (common.isDefined(x.formulaDeps) && x.formulaDeps.length > 0) {
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
          if (common.isUndefined(x.formulaError)) {
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

    if (report.rows.filter(x => common.isDefined(x.formulaError)).length > 0) {
      topQueryError = common.SOME_ROWS_HAVE_FORMULA_ERRORS;
    } else {
      let cn: pg.IConnectionParameters<pg.IClient> = {
        host: this.cs.get<interfaces.Config['firstProjectDwhPostgresHost']>(
          'firstProjectDwhPostgresHost'
        ),
        port: 5436,
        database: 'p_db',
        user: 'postgres',
        password: this.cs.get<
          interfaces.Config['firstProjectDwhPostgresPassword']
        >('firstProjectDwhPostgresPassword'),
        ssl: false
      };

      let timestampValues = reportDataColumns.map(
        x => x.fields['timestamp'] * 1000
      );

      // console.log(timestampValues);

      let mainSelect = [
        `unnest(ARRAY[${timestampValues}]::bigint[]) AS timestamp`,
        ...report.rows
          .filter(row => row.rowType === common.RowTypeEnum.Metric)
          .map(row => {
            let values = reportDataColumns.map(r =>
              common.isDefined(r.fields[row.rowId])
                ? r.fields[row.rowId]
                : 'NULL'
            );
            let str = `    unnest(ARRAY[${values}]::numeric[]) AS ${row.rowId}`;
            return str;
          })
      ];

      let mainSelectReady = mainSelect.join(',\n');

      let outerSelect = [
        `  main.timestamp as timestamp`,
        ...report.rows
          .filter(row => row.rowType === common.RowTypeEnum.Metric)
          .map(x => `  main.${x.rowId} AS ${x.rowId}`),
        ...report.rows
          .filter(row => row.rowType === common.RowTypeEnum.Formula)
          .map(row => {
            let newFormula = row.formula;
            let reg = common.MyRegex.CAPTURE_ROW_REF();
            let r;

            while ((r = reg.exec(newFormula))) {
              let reference = r[1];

              let targetRow = report.rows.find(y => y.rowId === reference);

              let targetTo =
                targetRow.rowType === common.RowTypeEnum.Formula
                  ? targetRow.formula
                  : targetRow.rowType === common.RowTypeEnum.Metric
                    ? `main.${targetRow.rowId}`
                    : reference;

              newFormula =
                targetRow.rowType === common.RowTypeEnum.Metric
                  ? common.MyRegex.replaceRowIdsFinalNoPars(
                      newFormula,
                      reference,
                      targetTo
                    )
                  : common.MyRegex.replaceRowIdsFinalAddPars(
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
                r[x] = common.isDefined(r[x]) ? Number(r[x]) : undefined;
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

    let lastCalculatedTs = Number(helper.makeTs());

    let newKits: schemaPostgres.KitEnt[] = [];

    report.rows
      .filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric ||
          row.rowType === common.RowTypeEnum.Formula
      )
      .forEach(row => {
        if (
          row.rowType === common.RowTypeEnum.Formula &&
          common.isDefined(row.formulaError)
        ) {
          row.topQueryError = row.formulaError;
          row.records = reportDataColumns.map((y: any, index) => {
            let unixTimeZoned = y.fields['timestamp'];
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: common.RowRecord = {
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
          row.rowType === common.RowTypeEnum.Formula &&
          common.isDefined(topQueryError)
        ) {
          row.topQueryError = topQueryError;
          row.records = reportDataColumns.map((y: any, index) => {
            let unixTimeZoned = y.fields['timestamp'];
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: common.RowRecord = {
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
          row.rowType === common.RowTypeEnum.Metric &&
          common.isDefined(topQueryError)
        ) {
          row.topQueryError = topQueryError;

          row.records = reportDataColumns.map((y: any, index) => {
            let unixTimeZoned = y.fields['timestamp'];
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: common.RowRecord = {
              columnLabel: undefined,
              id: index + 1,
              key: unixTimeZoned,
              // tsUTC: tsUTC,
              value: y.fields[row.rowId],
              error: undefined
            };

            return record;
          });
        } else if (common.isUndefined(topQueryError)) {
          row.topQueryError = undefined;

          row.records = topQueryData.map((y: any, index) => {
            let unixTimeZoned = y.timestamp / 1000;
            // let unixDateZoned = new Date(unixTimeZoned * 1000);
            // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

            let record: common.RowRecord = {
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

        if (row.rowType === common.RowTypeEnum.Formula) {
          rq.kitId = common.makeId();

          let newKit: schemaPostgres.KitEnt = {
            structId: report.structId,
            kitId: rq.kitId,
            reportId: report.reportId,
            data: row.records,
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
    report: common.ReportX;
    timeSpec: common.TimeSpecEnum;
  }) {
    let { report, timeSpec } = item;

    let reportDataColumns: common.ReportDataColumn[] = [];

    report.rows
      .filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric &&
          row.mconfig.select.length > 0 &&
          common.isDefined(row.query?.data)
      )
      .forEach(row => {
        row.query.data =
          row.mconfig?.modelType === common.ModelTypeEnum.Malloy
            ? row.query.data
                .filter((x: any) => common.isDefined(x.row))
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

    if (timeSpec !== common.TimeSpecEnum.Timestamps) {
      reportDataColumns = report.columns.map((column, i) => {
        let reportDataColumn: common.ReportDataColumn = {
          id: i,
          fields: {
            timestamp: column.columnId
          }
        };

        report.rows
          .filter(
            row =>
              row.rowType === common.RowTypeEnum.Metric &&
              row.mconfig.select.length > 0
          )
          .forEach((row: common.Row) => {
            let timeFieldId =
              row.mconfig?.modelType === common.ModelTypeEnum.Malloy
                ? row.mconfig?.select[0].split('.').join(DOUBLE_UNDERSCORE)
                : row.mconfig?.select[0].split('.').join('_').toLowerCase();

            let fieldId =
              row.mconfig?.modelType === common.ModelTypeEnum.Malloy
                ? row.mconfig?.select[1].split('.').join(DOUBLE_UNDERSCORE)
                : row.mconfig?.select[1].split('.').join('_').toLowerCase();

            let dataRow;

            if (row.mconfig.modelType === common.ModelTypeEnum.Store) {
              dataRow = row.query?.data?.find(
                (r: any) => r[timeFieldId] === column.columnId
              );
            } else {
              let tsDate = fromUnixTime(column.columnId);

              let timeValue =
                row.mconfig?.modelType === common.ModelTypeEnum.Malloy
                  ? tsDate.toISOString().slice(0, 19)
                  : timeSpec === common.TimeSpecEnum.Years
                    ? format(tsDate, 'yyyy')
                    : timeSpec === common.TimeSpecEnum.Quarters
                      ? format(tsDate, 'yyyy-MM')
                      : timeSpec === common.TimeSpecEnum.Months
                        ? format(tsDate, 'yyyy-MM')
                        : timeSpec === common.TimeSpecEnum.Weeks
                          ? format(tsDate, 'yyyy-MM-dd')
                          : timeSpec === common.TimeSpecEnum.Days
                            ? format(tsDate, 'yyyy-MM-dd')
                            : timeSpec === common.TimeSpecEnum.Hours
                              ? format(tsDate, 'yyyy-MM-dd HH')
                              : timeSpec === common.TimeSpecEnum.Minutes
                                ? format(tsDate, 'yyyy-MM-dd HH:mm')
                                : // : timeSpec === common.TimeSpecEnum.Timestamps
                                  // ? format(tsDate, 'yyyy-MM-dd HH:mm:ss.SSS')
                                  undefined;

              dataRow =
                row.mconfig?.modelType === common.ModelTypeEnum.Malloy
                  ? row.query?.data?.find(
                      (r: any) => r.row?.[timeFieldId]?.toString() === timeValue
                    )?.row
                  : row.query?.data?.find(
                      (r: any) => r[timeFieldId]?.toString() === timeValue
                    );
            }

            if (common.isDefined(dataRow)) {
              reportDataColumn.fields[row.rowId] = common.isUndefined(
                dataRow[fieldId]
              )
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
            row.rowType === common.RowTypeEnum.Metric &&
            row.mconfig.select.length > 0
        )
        .forEach((row: common.Row) => {
          let timeFieldId =
            row.mconfig?.modelType === common.ModelTypeEnum.Malloy
              ? row.mconfig?.select[0].split('.').join(DOUBLE_UNDERSCORE)
              : row.mconfig?.select[0].split('.').join('_').toLowerCase();

          let fieldId =
            row.mconfig?.modelType === common.ModelTypeEnum.Malloy
              ? row.mconfig?.select[1].split('.').join(DOUBLE_UNDERSCORE)
              : row.mconfig?.select[1].split('.').join('_').toLowerCase();

          (row.query?.data as any[])?.forEach(x => {
            let dataRow =
              row.mconfig?.modelType === common.ModelTypeEnum.Malloy
                ? x.row
                : x;

            let timestampString = dataRow[timeFieldId]?.toString();

            let columnId = dayjs(timestampString).valueOf() / 1000;

            let dataValue = common.isUndefined(dataRow[fieldId])
              ? undefined
              : isNaN(dataRow[fieldId]) === false
                ? Number(dataRow[fieldId])
                : dataRow[fieldId];

            let reportDataColumn = reportDataColumns.find(
              x => x.fields.timestamp === columnId
            );

            if (common.isUndefined(reportDataColumn)) {
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

            if (common.isUndefined(reportColumn)) {
              reportColumn = {
                columnId: columnId,
                // tsUTC: undefined,
                label: nodeCommon.nodeFormatTsUnix({
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
