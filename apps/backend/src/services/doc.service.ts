import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format, fromUnixTime } from 'date-fns';
import { forEachSeries } from 'p-iteration';
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

    let sender = axios.create({ baseURL: 'http://grist:8484/' });

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

    let createDocResp = await sender.post(
      `api/workspaces/2/docs`,
      createDoc,
      {}
    );

    let docId = createDocResp.data;

    let parametersTableId = 'Parameters';

    let valueColumns: any[] = [];
    let stringColumns: any[] = [];

    let record: any = {
      id: 1,
      fields: {}
    };

    rows
      .filter(row => row.rowType === common.RowTypeEnum.Metric)
      .forEach(row => {
        let rowParColumns: any[] = [];

        if (
          common.isUndefined(row.parametersFormula) &&
          common.isDefined(row.parameters)
        ) {
          // console.log('--- rowID');
          // console.log(row.rowId);
          row.parameters
            .sort((a, b) =>
              a.filter > b.filter ? 1 : b.filter > a.filter ? -1 : 0
            )
            .forEach(parameter => {
              let columnValue: any;
              let columnString: any;

              if (
                parameter.parameterType === common.ParameterTypeEnum.Formula &&
                common.isDefined(parameter.formula)
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

        // console.log(parametersColumnValue);
        // console.log(parametersColumnString);

        valueColumns.push(parametersColumnValue);
        stringColumns.push(parametersColumnString);
      });

    let columns: any[] = [...valueColumns, ...stringColumns];

    // columns.forEach(c => console.log(c));

    let createTables = {
      tables: [
        {
          id: parametersTableId,
          columns: columns
        }
      ]
    };

    console.log('createTables');

    let createTablesResp = await sender.post(
      `api/docs/${docId}/tables`,
      createTables,
      {}
    );

    console.log('createRecords');

    console.log('record');
    console.log([record]);

    let createRecordsResp = await sender.post(
      `api/docs/${docId}/tables/${parametersTableId}/records`,
      { records: [record] },
      {}
    );

    console.log('getRecords');

    let getRecordsResp = await sender.get(
      `api/docs/${docId}/tables/${parametersTableId}/records`,
      {}
    );

    let lastCalculatedTs = Number(helper.makeTs());

    let newKits: entities.KitEntity[] = [];

    let firstRecord = getRecordsResp.data.records[0];

    console.log('firstRecord', firstRecord);

    await forEachSeries(
      rows.filter(row => row.rowType === common.RowTypeEnum.Metric),
      async row => {
        // console.log('row.rowId');
        // console.log(row.rowId);
        let stringParametersColumn = `STRING_${row.rowId}_PARAMETERS`;

        let isParamsCalcValid = common.isUndefined(
          firstRecord.errors?.[stringParametersColumn]
        );

        let isParamsJsonValid = true;
        if (isParamsCalcValid === true) {
          try {
            JSON.parse(firstRecord.fields[stringParametersColumn]);
          } catch (e) {
            isParamsJsonValid = false;
          }
        }

        let parsedParameters: common.Parameter[] =
          isParamsCalcValid === true && isParamsJsonValid === true
            ? JSON.parse(firstRecord.fields[stringParametersColumn])
            : common.isDefined(firstRecord.errors?.[stringParametersColumn])
            ? firstRecord.errors[stringParametersColumn]
            : [];

        // console.log(row.rowId);
        // console.log(parsedParameters);

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
              row.parameters = parsedParameters.map((x: common.Parameter) => {
                let fieldId = x.filter.split('.').join('_').toUpperCase();
                let parameterId = `${row.rowId}_${fieldId}`;
                x.parameterId = parameterId;

                let metric = metrics.find(m => m.metric_id === row.metricId);
                let model = models.find(ml => ml.model_id === metric.model_id);
                let field = model.fields.find(f => f.id === x.filter);
                x.result = field.result;

                return x;
              });
            } else {
              row.parameters = [];
            }
          }
        }

        row.isParamsSchemaValid = isParamsSchemaValid;
        row.paramsSchemaError = paramsSchemaError;

        row.parameters
          .filter(
            p =>
              p.parameterType === common.ParameterTypeEnum.Formula ||
              common.isDefined(p.formula)
          )
          .forEach(p => {
            // console.log('p');
            // console.log(p);
            let parStr = `STRING_${p.parameterId}`;

            let isCalcValid = common.isUndefined(firstRecord.errors?.[parStr]);

            let isJsonValid = true;
            if (isCalcValid === true) {
              try {
                JSON.parse(firstRecord.fields[parStr]);
              } catch (e) {
                isJsonValid = false;
              }
            }

            p.isCalcValid = isCalcValid;
            p.isJsonValid = isJsonValid;

            if (p.isCalcValid === true && p.isJsonValid === true) {
              let parsedParameter = JSON.parse(firstRecord.fields[parStr]);

              p.conditions = parsedParameter.conditions;
            } else {
              p.conditions = ['any'];
            }
          });

        let filters: common.Filter[] = [];

        // if (
        //   // metric.type === common.MetricTypeEnum.Model &&
        //   // common.isDefined(x.parameters)
        // ) {

        await forEachSeries(row.parameters, async parameter => {
          let isConditionsStartValid = true;
          let conditionsError;

          if (common.isUndefined(parameter.conditions)) {
            isConditionsStartValid = false;
            conditionsError = 'Parameter conditions must be defined';
          } else if (!Array.isArray(parameter.conditions)) {
            isConditionsStartValid = false;
            conditionsError = 'Parameter conditions must be an array';
          } else if (parameter.conditions.length === 0) {
            isConditionsStartValid = false;
            conditionsError =
              'Parameter conditions must have at least one element';
          } else {
            parameter.conditions.forEach(c => {
              if (
                common.isUndefined(c) ||
                Array.isArray(c) ||
                c.constructor === Object
              ) {
                isConditionsStartValid = false;
                conditionsError =
                  'Parameter conditions must be an array of strings';
              }
            });
          }

          if (isConditionsStartValid === false) {
            parameter.conditions = ['any'];
          }

          // console.log('parameter');
          // console.log(parameter);

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

          // console.log(toBlockmlGetFractionsRequest.payload);

          let blockmlGetFractionsResponse =
            await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlGetFractionsResponse>(
              {
                routingKey:
                  common.RabbitBlockmlRoutingEnum.GetFractions.toString(),
                message: toBlockmlGetFractionsRequest,
                checkIsOk: true
              }
            );

          parameter.isConditionsValid =
            isConditionsStartValid === true &&
            blockmlGetFractionsResponse.payload.isValid === true;

          if (parameter.isConditionsValid === false) {
            row.isParamsSchemaValid = false;
          }

          if (
            isConditionsStartValid === true &&
            blockmlGetFractionsResponse.payload.isValid === false
          ) {
            conditionsError =
              'Parameter conditions are not valid for filter result';
          }

          parameter.conditionsError = conditionsError;

          let filter: common.Filter = {
            fieldId: parameter.filter,
            fractions: blockmlGetFractionsResponse.payload.fractions
          };

          filters.push(filter);
        });
        // }

        row.paramsFiltersWithExcludedTime = filters;

        let rc = row.rcs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        rc.kitId = common.makeId();

        let newKit: entities.KitEntity = {
          struct_id: structId,
          kit_id: rc.kitId,
          rep_id: repId,
          data: row,
          server_ts: undefined
        };
        newKits.push(newKit);

        rc.lastCalculatedTs = lastCalculatedTs;
      }
    );

    if (newKits.length > 0) {
      await this.dbService.writeRecords({
        modify: false,
        records: {
          kits: newKits
        }
      });
    }

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

    let sender = axios.create({ baseURL: 'http://grist:8484/' });

    axios.defaults.withCredentials = true;

    let backendGristApiKey =
      this.cs.get<interfaces.Config['backendGristApiKey']>(
        'backendGristApiKey'
      );

    sender.defaults.headers['Authorization'] = `Bearer ${backendGristApiKey}`;

    let createDoc = {
      // name: common.makeId()
      name: `data - traceId - ${traceId} - repId - ${rep.repId} - structId - ${rep.structId}`
    };

    let createDocResp = await sender.post(
      `api/workspaces/2/docs`,
      createDoc,
      {}
    );

    let docId = createDocResp.data;
    let metricsTableId = 'Metrics';

    let createTables = {
      tables: [
        {
          id: metricsTableId,
          columns: [
            {
              id: 'timestamp',
              fields: {
                type: 'Int',
                // widgetOptions:
                //   '{"widget":"TextBox","dateFormat":"YYYY-MM-DD","timeFormat":"h:mma","isCustomDateFormat":false,"isCustomTimeFormat":false,"alignment":"left","decimals":0}',
                isFormula: false
              }
            },
            ...rep.rows.map(x => ({
              id: x.rowId,
              fields: {
                type: 'Numeric',
                isFormula: x.rowType === common.RowTypeEnum.Formula,
                formula: x.formula
              }
            }))
          ]
        }
      ]
    };

    let createTablesResp = await sender.post(
      `api/docs/${docId}/tables`,
      createTables,
      {}
    );

    let recordsByColumn = this.makeRecordsByColumn({
      rep: rep,
      timeSpec: timeSpec
    });

    let createRecordsResp = await sender.post(
      `api/docs/${docId}/tables/${metricsTableId}/records`,
      {
        records: recordsByColumn
      },
      {}
    );

    let getRecordsResp = await sender.get(
      `api/docs/${docId}/tables/${metricsTableId}/records`,
      {}
    );

    let lastCalculatedTs = Number(helper.makeTs());

    let newKits: entities.KitEntity[] = [];

    rep.rows
      .filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric ||
          row.rowType === common.RowTypeEnum.Formula
      )
      .forEach(row => {
        row.records = getRecordsResp.data.records.map((y: any) => ({
          id: y.id,
          key: Number(y.fields.timestamp.toString().split('.')[0]),
          value: common.isDefined(y.fields) ? y.fields[row.rowId] : undefined,
          error: common.isDefined(y.errors) ? y.errors[row.rowId] : undefined
        }));

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
            let timeFieldId = row.mconfig?.select[0].split('.').join('_');

            let fieldId = row.mconfig?.select[1].split('.').join('_');

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
}
