import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format, fromUnixTime } from 'date-fns';
import { forEachSeries } from 'p-iteration';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { DbService } from './db.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class DocService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private rabbitService: RabbitService,
    private dbService: DbService
  ) {}

  async calculateParameters(item: {
    // rep: common.RepX;
    metrics: entities.MetricEntity[];
    models: entities.ModelEntity[];
    repId: string;
    structId: string;
    rows: common.Row[];
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    traceId: string;
  }) {
    let {
      repId,
      structId,
      rows,
      timeSpec,
      timeRangeFraction,
      timezone,
      models,
      metrics,
      traceId
    } = item;

    let parametersGristStartTs = Date.now();

    let gristHost =
      this.cs.get<interfaces.Config['backendGristHost']>('backendGristHost');

    let sender = axios.create({ baseURL: `http://${gristHost}:8484/` });

    axios.defaults.withCredentials = true;

    let backendGristApiKey =
      this.cs.get<interfaces.Config['backendGristApiKey']>(
        'backendGristApiKey'
      );

    sender.defaults.headers['Authorization'] = `Bearer ${backendGristApiKey}`;

    let createDoc = {
      // name: common.makeId()
      name: `parameters - traceId - ${traceId} - repId - ${repId} - structId - ${structId}`
    };

    let createDocStartTs = Date.now();

    let createDocResp = await sender.post(
      `api/workspaces/2/docs`,
      createDoc,
      {}
    );

    console.log(
      'parameters createDoc - duration: ',
      Date.now() - createDocStartTs
    );

    let docId = createDocResp.data;

    let parametersTableId = 'Parameters';

    let valueColumns: any[] = [];
    let stringColumns: any[] = [];

    let record: any = {
      id: 1,
      fields: {}
    };

    // console.log('rows:');
    // console.log(rows);

    rows
      .filter(row => row.rowType === common.RowTypeEnum.Metric)
      .forEach(row => {
        // console.log('row:');
        // console.log(row);

        let rowParColumns: any[] = [];

        if (
          common.isUndefined(row.parametersFormula) &&
          common.isDefined(row.parameters)
        ) {
          row.parameters
            .sort((a, b) =>
              a.filter > b.filter ? 1 : b.filter > a.filter ? -1 : 0
            )
            .forEach(parameter => {
              let columnValue: any;
              let columnString: any;

              if (
                parameter.parameterType === common.ParameterTypeEnum.Formula
              ) {
                columnValue = {
                  id: parameter.parameterId,
                  fields: {
                    type: 'Text',
                    isFormula: true,
                    formula: parameter.formula
                  }
                };

                columnString = {
                  id: `STRING_${parameter.parameterId}`,
                  fields: {
                    type: 'Text',
                    isFormula: true,
                    formula: `str($${parameter.parameterId})`
                  }
                };
              } else {
                columnValue = {
                  id: parameter.parameterId,
                  fields: {
                    type: 'Text',
                    isFormula: false
                  }
                };

                let prep = {
                  filter: parameter.filter,
                  conditions: parameter.conditions
                };

                record.fields[`${parameter.parameterId}`] =
                  JSON.stringify(prep);

                columnString = {
                  id: `STRING_${parameter.parameterId}`,
                  fields: {
                    type: 'Text',
                    isFormula: true,
                    formula: `str($${parameter.parameterId})`
                  }
                };
              }

              rowParColumns.push(columnValue);

              valueColumns.push(columnValue);
              stringColumns.push(columnString);
            });
        }

        let parametersColumnValue = {
          id: `${row.rowId}_PARAMETERS`,
          fields: {
            type: 'Text',
            isFormula: true,
            formula: common.isDefined(row.parametersFormula)
              ? row.parametersFormula
              : `import json
return json.dumps([${rowParColumns
                  .map(column => `json.loads($${column.id})`)
                  .join(', ')}])`
          }
        };

        let parametersColumnString = {
          id: `STRING_${row.rowId}_PARAMETERS`,
          fields: {
            type: 'Text',
            isFormula: true,
            formula: `str($${row.rowId}_PARAMETERS)`
          }
        };

        valueColumns.push(parametersColumnValue);
        stringColumns.push(parametersColumnString);
      });

    let columns: any[] = [...valueColumns, ...stringColumns];

    let createTables = {
      tables: [
        {
          id: parametersTableId,
          columns: columns
        }
      ]
    };

    let createTablesStartTs = Date.now();

    let createTablesResp = await sender.post(
      `api/docs/${docId}/tables`,
      createTables,
      {}
    );

    console.log(
      'parameters createTables - duration: ',
      Date.now() - createTablesStartTs
    );

    // console.log('record');
    // console.log([record]);

    let createRecordsStartTs = Date.now();

    let createRecordsResp = await sender.post(
      `api/docs/${docId}/tables/${parametersTableId}/records`,
      { records: [record] },
      {}
    );

    console.log(
      'parameters createRecords - duration: ',
      Date.now() - createRecordsStartTs
    );

    // console.log('getRecords');

    let getRecordsStartTs = Date.now();

    let getRecordsResp = await sender.get(
      `api/docs/${docId}/tables/${parametersTableId}/records`,
      {}
    );

    console.log(
      'parameters getRecordsDuration - duration: ',
      Date.now() - getRecordsStartTs
    );

    let lastCalculatedTs = Number(helper.makeTs());

    let newKits: entities.KitEntity[] = [];

    let firstRecord = getRecordsResp.data.records[0];

    // console.log('firstRecord', firstRecord);

    await forEachSeries(
      rows.filter(row => row.rowType === common.RowTypeEnum.Metric),
      async row => {
        let stringParametersColumn = `STRING_${row.rowId}_PARAMETERS`;

        let isParamsCalcValid = common.isUndefined(
          firstRecord.errors?.[stringParametersColumn]
        );

        let isParamsJsonValid = isParamsCalcValid === false ? false : true;

        if (isParamsCalcValid === true) {
          try {
            JSON.parse(firstRecord.fields[stringParametersColumn]);
          } catch (e) {
            isParamsJsonValid = false;
          }
        }

        let parsedParameters: common.Parameter[] =
          isParamsCalcValid === false
            ? firstRecord.errors[stringParametersColumn]
            : isParamsJsonValid === true
            ? JSON.parse(firstRecord.fields[stringParametersColumn])
            : [];

        row.isParamsCalcValid = isParamsCalcValid;
        row.isParamsJsonValid = isParamsJsonValid;
        row.parametersJson = common.makeCopy(parsedParameters);

        let isParamsSchemaValid = true;
        let paramsSchemaError;

        if (common.isDefined(row.parametersFormula)) {
          if (
            row.isParamsCalcValid === true &&
            row.isParamsJsonValid === true
          ) {
            if (!Array.isArray(parsedParameters)) {
              isParamsSchemaValid = false;
              paramsSchemaError = 'Parameters formula must return an array';
            }

            if (isParamsSchemaValid === true) {
              row.parameters = parsedParameters;
              row.parameters.forEach(x => {
                x.parameterType = common.ParameterTypeEnum.Field;
              });
            } else {
              row.parameters = [];
            }
          } else {
            row.parameters = [];
          }
        }

        row.isParamsSchemaValid = isParamsSchemaValid;
        row.paramsSchemaError = paramsSchemaError;

        let filters: common.Filter[] = [];

        await forEachSeries(row.parameters, async parameter => {
          let parsedParameter;

          if (parameter.parameterType === common.ParameterTypeEnum.Formula) {
            let parStr = `STRING_${parameter.parameterId}`;

            let isCalcValid = common.isUndefined(firstRecord.errors?.[parStr]);

            let isJsonValid = isCalcValid === false ? false : true;
            if (isCalcValid === true) {
              try {
                JSON.parse(firstRecord.fields[parStr]);
              } catch (e) {
                isJsonValid = false;
              }
            }

            parameter.isCalcValid = isCalcValid;
            if (parameter.isCalcValid === false) {
              row.isParamsCalcValid = false;
            }

            parameter.isJsonValid = isJsonValid;
            if (parameter.isJsonValid === false) {
              row.isParamsJsonValid = false;
            }

            if (
              parameter.isCalcValid === true &&
              parameter.isJsonValid === true
            ) {
              parsedParameter = JSON.parse(firstRecord.fields[parStr]);
              parameter.conditions = parsedParameter.conditions;
            } else {
              parameter.conditions = ['any'];
            }
          }

          let schemaError;
          let isSchemaValid = true;

          if (common.isUndefined(parameter)) {
            schemaError = 'Parameter must be defined';
            isSchemaValid = false;
          } else if (parameter.constructor !== Object) {
            schemaError = 'Parameter must be an object';
            isSchemaValid = false;
          } else if (common.isUndefined(parameter.filter)) {
            schemaError = 'Parameter must have a "filter" property';
            isSchemaValid = false;
          } else if (
            Array.isArray(parameter.filter) ||
            parameter.filter.constructor === Object
          ) {
            schemaError =
              'Parameter filter must be a string in a form of "alias.field_id"';
            isSchemaValid = false;
          } else if (common.isDefined(row.parametersFormula)) {
            let fieldId = parameter.filter.split('.').join('_').toUpperCase();
            parameter.parameterId = `${row.rowId}_${fieldId}`;

            let metric = metrics.find(m => m.metric_id === row.metricId);
            let model = models.find(ml => ml.model_id === metric.model_id);
            let field = model.fields.find(f => f.id === parameter.filter);

            if (common.isDefined(field)) {
              parameter.result = field.result;
            } else {
              schemaError =
                'Wrong parameter filter value. Model field is not found.';
              isSchemaValid = false;
            }
          }

          if (isSchemaValid === false) {
            parameter = {} as any;
            parameter.schemaError = schemaError;
            parameter.isSchemaValid = false;

            row.paramsSchemaError = schemaError;
            row.isParamsSchemaValid = false;
            return;
          }

          // schema is valid

          if (common.isUndefined(parameter.conditions)) {
            schemaError = 'Parameter conditions must be defined';
            isSchemaValid = false;
          } else if (!Array.isArray(parameter.conditions)) {
            schemaError = 'Parameter conditions must be an array';
            isSchemaValid = false;
          } else if (parameter.conditions.length === 0) {
            schemaError = 'Parameter conditions must have at least one element';
            isSchemaValid = false;
          } else {
            parameter.conditions.forEach(y => {
              if (
                common.isUndefined(y) ||
                Array.isArray(y) ||
                y.constructor === Object
              ) {
                schemaError =
                  'Parameter conditions must be an array of filter expressions';
                isSchemaValid = false;
              }
            });
          }

          if (isSchemaValid === false) {
            parameter.conditions = ['any'];
          }

          let toBlockmlGetFractionsRequest: apiToBlockml.ToBlockmlGetFractionsRequest =
            {
              info: {
                name: apiToBlockml.ToBlockmlRequestInfoNameEnum
                  .ToBlockmlGetFractions,
                traceId: traceId
              },
              payload: {
                bricks: parameter.conditions,
                result: parameter.result
              }
            };

          let blockmlGetFractionsResponse =
            await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlGetFractionsResponse>(
              {
                routingKey:
                  common.RabbitBlockmlRoutingEnum.GetFractions.toString(),
                message: toBlockmlGetFractionsRequest,
                checkIsOk: true
              }
            );

          if (blockmlGetFractionsResponse.payload.isValid === false) {
            schemaError = `Parameter conditions are not valid for filter result "${parameter.result}"`;
            isSchemaValid = false;
          }

          let filter: common.Filter = {
            fieldId: parameter.filter,
            fractions: blockmlGetFractionsResponse.payload.fractions
          };

          filters.push(filter);

          if (isSchemaValid === true && common.isDefined(parsedParameter)) {
            if (common.isUndefined(parsedParameter.filter)) {
              schemaError = `Parameter "${parameter.filter}" must have a "filter" property`;
              isSchemaValid = false;
            } else if (parameter.filter !== parsedParameter.filter) {
              schemaError = `parameter filter "${parameter.filter}" does not match "${parsedParameter.filter}"`;
              isSchemaValid = false;
            }
          }

          parameter.schemaError = schemaError;
          parameter.isSchemaValid = isSchemaValid;

          if (parameter.isSchemaValid === false) {
            row.paramsSchemaError = schemaError;
            row.isParamsSchemaValid = false;
          }
        });

        row.parametersFiltersWithExcludedTime = filters;
        row.isCalculateParameters = false;
      }
    );

    console.log(
      'parameters grist Total - duration: ',
      Date.now() - parametersGristStartTs
    );

    return rows;
  }

  async calculateData(item: {
    rep: common.RepX;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    traceId: string;
  }) {
    let { rep, timeSpec, timeRangeFraction, timezone, traceId } = item;

    let pgStartTs = Date.now();

    let cn: pg.IConnectionParameters<pg.IClient> = {
      host: this.cs.get<interfaces.Config['firstProjectDwhPostgresHost']>(
        'firstProjectDwhPostgresHost'
      ),
      port: 5432,
      database: 'p_db',
      user: 'postgres',
      password: this.cs.get<
        interfaces.Config['firstProjectDwhPostgresPassword']
      >('firstProjectDwhPostgresPassword'),
      ssl: false
    };

    let recordsByColumn = this.makeRecordsByColumn({
      rep: rep,
      timeSpec: timeSpec
    });

    console.log('recordsByColumn:');
    console.log(recordsByColumn);

    let timestampValues = recordsByColumn.map(x => x.fields['timestamp']);

    let mainSelect = [
      `unnest(ARRAY[${timestampValues}]) AS timestamp`,
      ...rep.rows
        .filter(row => row.rowType === common.RowTypeEnum.Metric)
        .map(row => {
          let values = recordsByColumn.map(r => r.fields[row.rowId] || 'NULL');
          let str = `    unnest(ARRAY[${values}]) AS ${row.rowId}`;
          return str;
        })
    ];

    let mainSelectReady = mainSelect.join(',\n');

    let outerSelect = [
      `  main.timestamp as timestamp`,
      ...rep.rows
        .filter(row => row.rowType === common.RowTypeEnum.Metric)
        // .map(x => `  CAST(main.${x.rowId} AS numeric) AS ${x.rowId}`),
        .map(x => `  main.${x.rowId} AS ${x.rowId}`),
      ...rep.rows
        .filter(row => row.rowType === common.RowTypeEnum.Formula)
        .map(row => {
          let newFormula = row.formula;
          let reg = common.MyRegex.CAPTURE_ROW_REF();
          let r;

          while ((r = reg.exec(newFormula))) {
            let reference = r[1];

            let targetRow = rep.rows.find(y => y.rowId === reference);

            let targetTo =
              targetRow.rowType === common.RowTypeEnum.Formula
                ? targetRow.formula
                : targetRow.rowType === common.RowTypeEnum.Metric
                ? `main.${targetRow.rowId}`
                : common.UNDEF;

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

    // console.log('');
    // console.log('querySql:');
    // console.log(querySql);

    let pgp = pgPromise({ noWarnings: true });
    let pgDb = pgp(cn);

    let queryData: any[] = [];
    let queryError: any;

    await pgDb
      .any(querySql)
      .then(async (data: any) => {
        // console.log('data:');
        // console.log(data);
        queryData = data.map((r: any) => {
          Object.keys(r)
            .filter(y => y !== 'timestamp')
            .forEach(x => {
              r[x] = common.isDefined(r[x]) ? Number(r[x]) : undefined;
            });

          return r;
        });
        // console.log('queryData:');
        // console.log(queryData);
      })
      .catch(async (e: any) => {
        queryError = e;
        console.log('query error:');
        console.log(e);
      });

    console.log('Total pg - duration: ', Date.now() - pgStartTs);

    //

    let lastCalculatedTs = Number(helper.makeTs());

    let newKits: entities.KitEntity[] = [];

    rep.rows
      .filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric ||
          row.rowType === common.RowTypeEnum.Formula
      )
      .forEach(row => {
        if (
          common.isDefined(queryError) &&
          row.rowType === common.RowTypeEnum.Formula
        ) {
          row.records = [
            {
              id: 1,
              key: 0,
              value: undefined,
              error: queryError.message
            }
          ];
        } else if (
          common.isDefined(queryError) &&
          row.rowType === common.RowTypeEnum.Metric
        ) {
          row.records = recordsByColumn.map((y: any, index) => ({
            id: index + 1,
            key: Number(y.fields['timestamp'].toString().split('.')[0]),
            value: y.fields[row.rowId] || 'NULL',
            error: undefined
          }));
        } else if (common.isUndefined(queryError)) {
          row.records = queryData.map((y: any, index) => ({
            id: index + 1,
            key: Number(y.timestamp.toString().split('.')[0]),
            value: y[row.rowId.toLowerCase()],
            error: undefined
          }));
        }

        let rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (row.rowType === common.RowTypeEnum.Formula) {
          rq.kitId = common.makeId();

          let newKit: entities.KitEntity = {
            struct_id: rep.structId,
            kit_id: rq.kitId,
            rep_id: rep.repId,
            data: row.records,
            server_ts: undefined
          };

          newKits.push(newKit);
        }

        rq.lastCalculatedTs = lastCalculatedTs;
      });

    if (newKits.length > 0) {
      await this.dbService.writeRecords({
        modify: false,
        records: {
          kits: newKits
        }
      });
    }

    return rep;
  }

  makeRecordsByColumn(item: {
    rep: common.RepX;
    timeSpec: common.TimeSpecEnum;
  }) {
    let { rep, timeSpec } = item;

    let zeroColumnId = 0;

    let zeroColumn: common.Column = {
      columnId: zeroColumnId,
      label: 'ZeroColumn'
    };

    let recordsByColumn = [zeroColumn, ...rep.columns].map((column, i) => {
      let tsDate = fromUnixTime(column.columnId);

      let timeValue =
        timeSpec === common.TimeSpecEnum.Years
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
          : undefined;

      let record: any = {
        id: i + 1,
        fields: {
          timestamp: column.columnId
        }
      };

      rep.rows
        .filter(row => row.rowType === common.RowTypeEnum.Metric)
        .forEach((row: common.Row) => {
          if (column.columnId === zeroColumnId) {
            record.fields[row.rowId] = 0;
          } else {
            let timeFieldId = row.mconfig?.select[0]
              .split('.')
              .join('_')
              .toLowerCase();

            let fieldId = row.mconfig?.select[1]
              .split('.')
              .join('_')
              .toLowerCase();

            if (common.isDefined(row.query?.data)) {
              row.query.data = row.query.data.map((x: any) =>
                Object.keys(x).reduce((destination: any, key) => {
                  destination[key.toLowerCase()] = x[key];
                  return destination;
                }, {})
              );
            }

            let dataRow = row.query?.data?.find(
              (r: any) => r[timeFieldId]?.toString().split('.')[0] === timeValue
            );

            if (common.isDefined(dataRow)) {
              record.fields[row.rowId] = common.isUndefined(dataRow[fieldId])
                ? undefined
                : isNaN(dataRow[fieldId]) === false
                ? Number(dataRow[fieldId])
                : dataRow[fieldId];
            }
          }
        });

      return record;
    });

    return recordsByColumn;
  }

  // async calculateDataOld(item: {
  //   rep: common.RepX;
  //   timezone: string;
  //   timeSpec: common.TimeSpecEnum;
  //   timeRangeFraction: common.Fraction;
  //   traceId: string;
  // }) {
  //   let { rep, timeSpec, timeRangeFraction, timezone, traceId } = item;

  //   let gristStartTs = Date.now();

  //   let gristHost =
  //     this.cs.get<interfaces.Config['backendGristHost']>('backendGristHost');

  //   let sender = axios.create({ baseURL: `http://${gristHost}:8484/` });

  //   axios.defaults.withCredentials = true;

  //   let backendGristApiKey =
  //     this.cs.get<interfaces.Config['backendGristApiKey']>(
  //       'backendGristApiKey'
  //     );

  //   sender.defaults.headers['Authorization'] = `Bearer ${backendGristApiKey}`;

  //   let createDoc = {
  //     // name: common.makeId()
  //     name: `data - traceId - ${traceId} - repId - ${rep.repId} - structId - ${rep.structId}`
  //   };

  //   let createDocStartTs = Date.now();

  //   let createDocResp = await sender.post(
  //     `api/workspaces/2/docs`,
  //     createDoc,
  //     {}
  //   );

  //   console.log('data createDoc - duration: ', Date.now() - createDocStartTs);

  //   let docId = createDocResp.data;
  //   let metricsTableId = 'Metrics';

  //   let createTables = {
  //     tables: [
  //       {
  //         id: metricsTableId,
  //         columns: [
  //           {
  //             id: 'timestamp',
  //             fields: {
  //               type: 'Int',
  //               // widgetOptions:
  //               //   '{"widget":"TextBox","dateFormat":"YYYY-MM-DD","timeFormat":"h:mma","isCustomDateFormat":false,"isCustomTimeFormat":false,"alignment":"left","decimals":0}',
  //               isFormula: false
  //             }
  //           },
  //           ...rep.rows.map(x => ({
  //             id: x.rowId,
  //             fields: {
  //               type: 'Numeric',
  //               isFormula: x.rowType === common.RowTypeEnum.Formula,
  //               formula: x.formula
  //             }
  //           }))
  //         ]
  //       }
  //     ]
  //   };

  //   let createTablesStartTs = Date.now();

  //   let createTablesResp = await sender.post(
  //     `api/docs/${docId}/tables`,
  //     createTables,
  //     {}
  //   );

  //   console.log(
  //     'data createTables - duration: ',
  //     Date.now() - createTablesStartTs
  //   );

  //   let recordsByColumn = this.makeRecordsByColumn({
  //     rep: rep,
  //     timeSpec: timeSpec
  //   });

  //   // console.log('recordsByColumn:');
  //   // console.log(recordsByColumn);

  //   let createRecordsStartTs = Date.now();

  //   let createRecordsResp = await sender.post(
  //     `api/docs/${docId}/tables/${metricsTableId}/records`,
  //     {
  //       records: recordsByColumn
  //     },
  //     {}
  //   );

  //   console.log(
  //     'data createRecords - duration: ',
  //     Date.now() - createRecordsStartTs
  //   );

  //   let getRecordsStartTs = Date.now();

  //   let getRecordsResp = await sender.get(
  //     `api/docs/${docId}/tables/${metricsTableId}/records`,
  //     {}
  //   );

  //   console.log('data getRecords - duration: ', Date.now() - getRecordsStartTs);

  //   console.log('Total grist - duration: ', Date.now() - gristStartTs);

  //   let lastCalculatedTs = Number(helper.makeTs());

  //   let newKits: entities.KitEntity[] = [];

  //   console.log('getRecordsResp.data.records[1].fields:');
  //   console.log(getRecordsResp.data.records[1].fields);

  //   rep.rows
  //     .filter(
  //       row =>
  //         row.rowType === common.RowTypeEnum.Metric ||
  //         row.rowType === common.RowTypeEnum.Formula
  //     )
  //     .forEach(row => {
  //       row.records = getRecordsResp.data.records.map((y: any) => ({
  //         id: y.id,
  //         key: Number(y.fields.timestamp.toString().split('.')[0]),
  //         value: common.isDefined(y.fields) ? y.fields[row.rowId] : undefined,
  //         error: common.isDefined(y.errors) ? y.errors[row.rowId] : undefined
  //       }));

  //       let rq = row.rqs.find(
  //         y =>
  //           y.fractionBrick === timeRangeFraction.brick &&
  //           y.timeSpec === timeSpec &&
  //           y.timezone === timezone
  //       );

  //       if (row.rowType === common.RowTypeEnum.Formula) {
  //         rq.kitId = common.makeId();

  //         let newKit: entities.KitEntity = {
  //           struct_id: rep.structId,
  //           kit_id: rq.kitId,
  //           rep_id: rep.repId,
  //           data: row.records,
  //           server_ts: undefined
  //         };

  //         newKits.push(newKit);
  //       }

  //       rq.lastCalculatedTs = lastCalculatedTs;
  //     });

  //   if (newKits.length > 0) {
  //     await this.dbService.writeRecords({
  //       modify: false,
  //       records: {
  //         kits: newKits
  //       }
  //     });
  //   }

  //   return rep;
  // }
}
