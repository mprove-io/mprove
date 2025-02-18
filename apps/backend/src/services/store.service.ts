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
import { UserCodeService } from './user-code.service';

let retry = require('async-retry');
let axios = require('axios');
const { JWT } = require('google-auth-library');

@Injectable()
export class StoreService {
  constructor(
    private userCodeService: UserCodeService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async adjustMconfig(item: { mconfig: common.Mconfig; model: common.Model }) {
    let { model, mconfig } = item;

    let newMconfig = common.makeCopy(mconfig);

    // remove filter controls if show_if deps not match
    (
      model.content as common.FileStore
    ).filterControlsSortedByShowIfDeps.forEach(filterDotControl => {
      let filterName = filterDotControl.split('.')[0];
      let controlName = filterDotControl.split('.')[1];

      let isCheck = true;

      while (isCheck === true) {
        let isRemove = false as boolean;

        let selectedFilter = newMconfig.filters.find(
          x => x.fieldId === `${common.MF}.${filterName}`
        );

        if (common.isDefined(selectedFilter)) {
          selectedFilter.fractions.forEach(selectedFraction => {
            // controls will be removed from all fractions - no need to check other fractions if isRemove true
            if (isRemove === false) {
              let selectedControl = selectedFraction.controls.find(
                fc => fc.name === controlName
              );

              if (common.isDefined(selectedControl)) {
                selectedControl.showIfDepsIncludingParentFilter.forEach(dep => {
                  if (isRemove === false) {
                    let depSelectedFilter = newMconfig.filters.find(
                      y => y.fieldId === `${common.MF}.${dep.filterName}`
                    );

                    if (common.isUndefined(depSelectedFilter)) {
                      isRemove = true;
                      return;
                    }

                    depSelectedFilter.fractions.forEach(y => {
                      let depSelectedControl = y.controls.find(
                        c => c.name === dep.controlName
                      );

                      if (
                        common.isUndefined(depSelectedControl) ||
                        depSelectedControl.value?.toString() !==
                          dep.value.toString()
                      ) {
                        isRemove = true;
                        return;
                      }
                    });
                  }
                });
              }
            }
          });
        }

        if (isRemove === true) {
          let filter = newMconfig.filters.find(
            x => x.fieldId === `${common.MF}.${filterName}`
          );

          filter.fractions.forEach(fraction => {
            fraction.controls = fraction.controls.filter(
              control => control.name !== controlName
            );
          });
        } else {
          isCheck = false;
        }
      }
    });

    // add required filter controls, if show_if allows
    (
      model.content as common.FileStore
    ).filterControlsSortedByShowIfDeps.forEach(filterDotControl => {
      let filterName = filterDotControl.split('.')[0];
      let controlName = filterDotControl.split('.')[1];

      let storeFilter = (model.content as common.FileStore).fields
        .filter(x => x.fieldClass === common.FieldClassEnum.Filter)
        .find(x => x.name === filterName);

      if (common.toBooleanFromLowercaseString(storeFilter.required) === true) {
        let filterShowIfAllows = true;

        if (common.isDefined(storeFilter.show_if)) {
          let reg = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

          let r = reg.exec(storeFilter.show_if);

          let sFilterName = r[1];
          let sFractionControlName = r[2];
          let sControlValue = r[3];

          let sDepSelectedFilter = newMconfig.filters.find(
            y => y.fieldId === `${common.MF}.${sFilterName}`
          );

          if (
            common.isUndefined(sDepSelectedFilter) ||
            sDepSelectedFilter.fractions.length === 0
          ) {
            filterShowIfAllows = false;
          } else {
            let sDepSelectedControl =
              sDepSelectedFilter.fractions[0].controls.find(
                x => x.name === sFractionControlName
              );

            if (
              common.isUndefined(sDepSelectedControl) ||
              sDepSelectedControl.value?.toString() !== sControlValue.toString()
            ) {
              filterShowIfAllows = false;
            }
          }
        }

        if (filterShowIfAllows === true) {
          let selectedFilter = newMconfig.filters.find(
            x => x.fieldId === `${common.MF}.${filterName}`
          );

          if (common.isUndefined(selectedFilter)) {
            let newFraction = {
              type: common.FractionTypeEnum.StoreFraction,
              controls: [] as any[],
              brick: undefined as any,
              operator: undefined as any
            };

            let newFilter: common.Filter = {
              fieldId: `${common.MF}.${filterName}`,
              fractions: [newFraction]
            };

            newMconfig.filters.push(newFilter);

            selectedFilter = newFilter;
          }

          let storeFractionControl = storeFilter.fraction_controls.find(
            x => x.name === controlName
          );

          let controlShowIfAllows = true;

          if (common.isDefined(storeFractionControl.show_if)) {
            let reg = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

            let r = reg.exec(storeFractionControl.show_if);

            let cFilterName = r[1];
            let cFractionControlName = r[2];
            let cControlValue = r[3];

            let cDepSelectedFilter = newMconfig.filters.find(
              y => y.fieldId === `${common.MF}.${cFilterName}`
            );

            if (
              common.isUndefined(cDepSelectedFilter) ||
              cDepSelectedFilter.fractions.length === 0
            ) {
              controlShowIfAllows = false;
            } else {
              let cDepSelectedControl =
                cDepSelectedFilter.fractions[0].controls.find(
                  x => x.name === cFractionControlName
                );

              if (
                common.isUndefined(cDepSelectedControl) ||
                cDepSelectedControl.value?.toString() !==
                  cControlValue.toString()
              ) {
                controlShowIfAllows = false;
              }
            }
          }

          if (controlShowIfAllows === true) {
            let selectedControl = selectedFilter.fractions[0].controls.find(
              x => x.name === storeFractionControl.name
            );

            if (common.isUndefined(selectedControl)) {
              let newControl: common.FractionControl = {
                input: storeFractionControl.input,
                switch: storeFractionControl.switch,
                datePicker: storeFractionControl.date_picker,
                selector: storeFractionControl.selector,
                options: storeFractionControl.options,
                value: storeFractionControl.value,
                label: storeFractionControl.label,
                isArray: common.toBooleanFromLowercaseString(
                  storeFractionControl.is_array
                ),
                showIf: storeFractionControl.show_if,
                required: storeFractionControl.required,
                name: storeFractionControl.name,
                controlClass: storeFractionControl.controlClass,
                showIfDepsIncludingParentFilter:
                  storeFractionControl.showIfDepsIncludingParentFilter
              };

              selectedFilter.fractions[0].controls.push(newControl);
            }
          }
        }
      }
    });

    return newMconfig;
  }

  async runUserCode(item: {
    input: string;
    mconfig: common.Mconfig;
    model: common.Model;
  }) {
    let { input, mconfig, model } = item;

    let inputSub = input;

    let reg = common.MyRegex.CAPTURE_S_REF();
    let r;

    let refError;

    let selectedDimensions = (model.content as common.FileStore).fields
      .filter(field => field.fieldClass === common.FieldClassEnum.Dimension)
      .filter(f => mconfig.select.indexOf(`${f.group}.${f.name}`) > -1);

    let selectedMeasures = (model.content as common.FileStore).fields
      .filter(field => field.fieldClass === common.FieldClassEnum.Measure)
      .filter(f => mconfig.select.indexOf(`${f.group}.${f.name}`) > -1);

    let orderByElements: {
      fieldId: string;
      field: common.FieldAny;
      desc: boolean;
    }[] = [];

    mconfig.sortings.forEach(sorting => {
      let orderByElement = {
        fieldId: sorting.fieldId,
        field: (model.content as common.FileStore).fields.find(
          field => `${field.group}.${field.name}` === sorting.fieldId
        ),
        desc: sorting.desc
      };
      orderByElements.push(orderByElement);
    });

    while ((r = reg.exec(inputSub))) {
      let reference = r[1];

      let target: any;

      if (reference === 'QUERY_ORDER_BY') {
        target = JSON.stringify(orderByElements);
      } else if (reference === 'QUERY_SELECTED_DIMENSIONS') {
        target = JSON.stringify(selectedDimensions);
      } else if (reference === 'QUERY_SELECTED_MEASURES') {
        target = JSON.stringify(selectedMeasures);
      } else if (reference === 'QUERY_PARAMETERS') {
        target = JSON.stringify(mconfig.filters);
      } else if (reference === 'QUERY_LIMIT') {
        target = JSON.stringify(mconfig.limit);
      } else if (reference === 'UTC_MS_SUFFIX') {
        target = '__utc_ms';
        // } else if (reference === 'QUERY_TIMEZONE') {
        //   target = '...';
        // } else if (reference === 'QUERY_RESPONSE') {
        //   target = '...';
        // } else if (reference === 'QUERY_FIELDS') {
        //   target = '...';
        // } else if (reference === 'ENV_GA_PROPERTY_ID_1') {
        //   target = '...';
        // } else if (reference === 'ENV_GA_PROPERTY_ID_2') {
        //   target = '...';
        // } else if (reference === 'METRICS_DATE_FROM') {
        //   target = '...';
        // } else if (reference === 'METRICS_DATE_TO') {
        //   target = '...';
        // } else if (reference === 'DATE_TODAY') {
        //   target = '...';
        // } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
        //   target = '...';
      } else {
        refError = `Unknown reference $${reference}`;
        break;
      }

      inputSub = common.MyRegex.replaceSRefs(inputSub, reference, target);
    }

    if (common.isDefined(refError)) {
      return {
        value: 'Error',
        errorMessage: refError
      };
    }

    let urlPathUserCode = `JSON.stringify((function() {
${inputSub}
})())`;

    let urlPathRs = await this.userCodeService.runOnly({
      userCode: urlPathUserCode
    });

    return {
      value: urlPathRs.outValue,
      error: urlPathRs.outError,
      inputSub: inputSub
    };
  }

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

      // response = // TODO:
      //   queryStart.apiMethod === common.StoreMethodEnum.Post
      //     ? await axios.post(url, body, { headers: headers })
      //     : queryStart.apiMethod === common.StoreMethodEnum.Get
      //     ? await axios.get(url, body, { headers: headers })
      //     : { message: 'method must be POST or GET' };

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
