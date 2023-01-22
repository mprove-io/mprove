import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class DocService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async getData(item: { rep: common.Rep }) {
    let { rep } = item;

    let sender = axios.create({ baseURL: 'http://grist:8484/' });

    axios.defaults.withCredentials = true;

    let backendGristApiKey =
      this.cs.get<interfaces.Config['backendGristApiKey']>(
        'backendGristApiKey'
      );

    sender.defaults.headers['Authorization'] = `Bearer ${backendGristApiKey}`;

    let createDoc = {
      // name: common.makeId()
      name: rep.repId
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
                // formula: ''
                // label: 'timestamp'
              }
            },
            // {
            //   id: 'utc',
            //   fields: {
            //     type: 'Int',
            //     isFormula: false
            //   }
            // },
            ...rep.rows.map(x => ({
              id: x.rowId,
              fields: {
                type: 'Numeric'
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

    let createRecords = {
      records: rep.columns.map((x, i) => {
        let record = {
          id: i + 1,
          fields: {
            timestamp: x.columnId
            // ,
            // utc: x.getUTCSeconds()
          }
        };

        return record;
      })
    };

    let createRecordsResp = await sender.post(
      `api/docs/${docId}/tables/${metricsTableId}/records`,
      createRecords,
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
    });

    return rep;
  }
}
