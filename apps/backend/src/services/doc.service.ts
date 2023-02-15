import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format, fromUnixTime } from 'date-fns';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class DocService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async getData(item: {
    rep: common.RepX;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
  }) {
    let { rep, timeSpec, timeRangeFraction, timezone } = item;

    let sender = axios.create({ baseURL: 'http://grist:8484/' });

    axios.defaults.withCredentials = true;

    let backendGristApiKey =
      this.cs.get<interfaces.Config['backendGristApiKey']>(
        'backendGristApiKey'
      );

    sender.defaults.headers['Authorization'] = `Bearer ${backendGristApiKey}`;

    let createDoc = {
      // name: common.makeId()
      name: `${rep.repId}-${rep.structId}`
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
                isFormula: common.isDefined(x.formula),
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

    let dataRecords = this.makeDataRecords({
      rep: rep,
      timeSpec: timeSpec
    });

    let createRecordsResp = await sender.post(
      `api/docs/${docId}/tables/${metricsTableId}/records`,
      {
        records: dataRecords
      },
      {}
    );

    let getRecordsResp = await sender.get(
      `api/docs/${docId}/tables/${metricsTableId}/records`,
      {}
    );

    rep.rows.forEach(x => {
      x.records = getRecordsResp.data.records.map((y: any) => ({
        id: y.id,
        key: y.fields.timestamp,
        value:
          common.isDefined(y.fields.errors) &&
          common.isDefined(y.fields.errors[x.rowId])
            ? y.fields.errors[x.rowId]
            : y.fields[x.rowId]
      }));

      let rq = x.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      rq.records = x.records;
      rq.lastCalculatedTs = common.isDefined(x.query)
        ? x.query.lastCompleteTs
        : Number(helper.makeTs());
    });

    return rep;
  }

  makeDataRecords(item: { rep: common.RepX; timeSpec: common.TimeSpecEnum }) {
    let { rep, timeSpec } = item;

    return rep.columns.map((x, i) => {
      let tsDate = fromUnixTime(x.columnId);

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
          timestamp: x.columnId
        }
      };

      rep.rows
        .filter(
          y => common.isDefined(y.mconfig) && common.isDefined(y.query?.data)
        )
        .forEach((row: common.Row) => {
          let timeFieldId = row.mconfig.select[0].split('.').join('_');

          let fieldId = row.mconfig.select[1].split('.').join('_');

          let dataRow = row.query.data.find(
            (r: any) => r[timeFieldId]?.toString() === timeValue
          );

          if (common.isDefined(dataRow)) {
            record.fields[row.rowId] = dataRow[fieldId];
          }
        });

      return record;
    });
  }
}
