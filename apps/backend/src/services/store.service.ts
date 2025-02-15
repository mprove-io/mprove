/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';

let retry = require('async-retry');
let axios = require('axios');
const { JWT } = require('google-auth-library');

@Injectable()
export class StoreService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQuery(item: {
    connection: schemaPostgres.ConnectionEnt;
    queryJobId: string;
    queryId: string;
    projectId: string;
  }) {
    let { connection, queryJobId, queryId, projectId } = item;

    let queryStart = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, queryId),
        eq(queriesTable.queryJobId, queryJobId),
        eq(queriesTable.projectId, projectId)
      )
    });

    try {
      // let body = queryStart.apiBody; // TODO:
      let body = {
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today'
          }
        ],
        dimensions: [
          {
            name: 'year' // "2025"
          },
          {
            name: 'yearMonth' // "202501"
          },
          {
            name: 'isoYearIsoWeek' // "202504"
          },
          {
            name: 'yearWeek' // "202505"
          },
          {
            name: 'date' // "20250127"
          },
          {
            name: 'dateHour' // "2025012722"
          },
          {
            name: 'dateHourMinute' // "202501272212"
          },
          {
            name: 'country'
          },
          {
            name: 'city'
          }
        ],
        metrics: [
          {
            name: 'activeUsers'
          },
          {
            name: 'sessions'
          },
          {
            name: 'screenPageViews'
          }
        ],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                orGroup: {
                  expressions: [
                    {
                      filter: {
                        fieldName: 'city',
                        stringFilter: {
                          value: 'Helsinki'
                        }
                      }
                    },
                    {
                      filter: {
                        fieldName: 'country',
                        stringFilter: {
                          value: 'Finland'
                        }
                      }
                    }
                  ]
                }
              },
              {
                notExpression: {
                  filter: {
                    fieldName: 'city',
                    stringFilter: {
                      value: 'Atlanta'
                    }
                  }
                }
              },
              {
                notExpression: {
                  filter: {
                    fieldName: 'country',
                    stringFilter: {
                      value: 'US'
                    }
                  }
                }
              }
            ]
          }
        }
      };

      // let url = queryStart.apiUrl // TODO:
      let url = `https://analyticsdata.googleapis.com/v1beta/properties/474781769:runReport`;

      let headers: any = {};

      connection.headers.forEach(header => {
        headers[header.key] = header.value;
      });

      let response;

      if (connection.type === common.ConnectionTypeEnum.GoogleApi) {
        let googleAccessToken;

        let authClient = new JWT({
          email: (connection.serviceAccountCredentials as any).client_email,
          key: (connection.serviceAccountCredentials as any).private_key,
          scopes: ['https://www.googleapis.com/auth/analytics.readonly'] // TODO: add scopes to connection dialogs
        });

        let tokens = await authClient.authorize();

        googleAccessToken = tokens.access_token;

        headers['Authorization'] = `Bearer ${googleAccessToken}`;
        headers['Content-Type'] = 'application/json';
      }

      response =
        queryStart.apiMethod === common.StoreMethodEnum.Post
          ? await axios.post(url, body, { headers: headers })
          : queryStart.apiMethod === common.StoreMethodEnum.Get
          ? await axios.get(url, body, { headers: headers })
          : { message: 'method must be POST or GET' };

      // let data = response.data; // TODO:
      let data: any = [];

      let q = await this.db.drizzle.query.queriesTable.findFirst({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      });

      if (common.isDefined(q)) {
        q.status = common.QueryStatusEnum.Completed;
        q.queryJobId = undefined; // null;
        q.data = data;
        q.lastCompleteTs = makeTsNumber();
        q.lastCompleteDuration = Math.floor(
          (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
        );

        await retry(
          async () =>
            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.write({
                  tx: tx,
                  insertOrUpdate: {
                    queries: [q]
                  }
                })
            ),
          getRetryOption(this.cs, this.logger)
        );
      }
    } catch (e: any) {
      let q = await this.db.drizzle.query.queriesTable.findFirst({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      });

      if (common.isDefined(q)) {
        q.status = common.QueryStatusEnum.Error;
        q.data = [];
        q.queryJobId = undefined; // null
        q.lastErrorMessage = e.message;
        q.lastErrorTs = makeTsNumber();

        await retry(
          async () =>
            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.write({
                  tx: tx,
                  insertOrUpdate: {
                    queries: [q]
                  }
                })
            ),
          getRetryOption(this.cs, this.logger)
        );
      }
    }
  }
}
