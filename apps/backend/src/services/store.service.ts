/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { toBooleanFromLowercaseString } from '~common/_index';
import { getYYYYMMDDCurrentDateByTimezone } from '~node-common/functions/get-yyyymmdd-current-date-by-timezone';
import { UserCodeService } from './user-code.service';

let retry = require('async-retry');
let axios = require('axios');
const { JWT } = require('google-auth-library');

export interface StoreUserCodeReturn {
  userCode: string;
  result: string;
  errorMessage: string;
}

@Injectable()
export class StoreService {
  constructor(
    private userCodeService: UserCodeService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async adjustMconfig(item: {
    mconfig: common.Mconfig;
    model: common.Model;
    caseSensitiveStringFilters: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }) {
    let {
      model,
      mconfig,
      caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD
    } = item;

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
          x => x.fieldId === `${filterName}`
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
                      y => y.fieldId === `${dep.filterName}`
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
            x => x.fieldId === `${filterName}`
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
            y => y.fieldId === `${sFilterName}`
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
            x => x.fieldId === `${filterName}`
          );

          if (common.isUndefined(selectedFilter)) {
            let newFraction: common.Fraction = {
              type: common.FractionTypeEnum.StoreFraction,
              controls: [] as any[],
              brick: undefined as any,
              operator: undefined as any
            };

            let newFilter: common.Filter = {
              fieldId: `${filterName}`,
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
              y => y.fieldId === `${cFilterName}`
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
                options: storeFractionControl.options,
                value: storeFractionControl.value,
                label: storeFractionControl.label,
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

    newMconfig.filters.forEach(filter => {
      filter.fractions.forEach(fraction => {
        fraction.controls
          .filter(
            control =>
              common.isDefinedAndNotEmpty(control.value) &&
              typeof control.value === 'string'
          )
          .forEach(control => {
            let newValue = control.value;

            let reg = common.MyRegex.CAPTURE_S_REF();
            let r;

            // let refError;

            while ((r = reg.exec(newValue))) {
              let reference = r[1];

              let target: any;

              if (reference === 'METRICS_DATE_FROM') {
                target = common.isDefined(metricsStartDateYYYYMMDD)
                  ? metricsStartDateYYYYMMDD
                  : getYYYYMMDDCurrentDateByTimezone({
                      timezone: mconfig.timezone
                    });
              } else if (reference === 'METRICS_DATE_TO') {
                target = common.isDefined(metricsEndDateYYYYMMDD)
                  ? metricsEndDateYYYYMMDD
                  : getYYYYMMDDCurrentDateByTimezone({
                      timezone: mconfig.timezone
                    });
              } else if (reference === 'DATE_TODAY') {
                target = getYYYYMMDDCurrentDateByTimezone({
                  timezone: mconfig.timezone
                });
              } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
                target = caseSensitiveStringFilters;
                // } else if (reference === 'ENV_GA_PROPERTY_ID_1') { // TODO:
                //   target = '...';
              } else {
                target = null;
                // refError = `Unknown reference in store.${storeParam}: $${reference}`;
                // break;
              }

              newValue = common.MyRegex.replaceSRefs(
                newValue,
                reference,
                target
              );
            }

            control.value =
              control.controlClass === common.ControlClassEnum.Switch &&
              typeof newValue === 'string'
                ? toBooleanFromLowercaseString(newValue)
                : newValue;
            // console.log('control.value');
            // console.log(control.value);
          });
      });
    });

    let addSelect: string[] = [];

    (model.content as common.FileStore).fields
      .filter(
        storeField =>
          common.toBooleanFromLowercaseString(storeField.required) === true
      )
      .forEach(field => {
        if (newMconfig.select.indexOf(field.name) < 0) {
          addSelect.push(field.name);
        }
      });

    newMconfig.select = [...newMconfig.select, ...addSelect];

    return newMconfig;
  }

  async transformStoreRequestPart(item: {
    input: string;
    mconfig: common.Mconfig;
    storeModel: common.Model;
    storeParam: common.ParameterEnum;
    caseSensitiveStringFilters: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }): Promise<StoreUserCodeReturn> {
    let {
      input,
      mconfig,
      storeModel,
      storeParam,
      caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD
    } = item;

    let inputSub = input;

    let reg = common.MyRegex.CAPTURE_S_REF();
    let r;

    let refError;

    let selectedDimensions = (storeModel.content as common.FileStore).fields
      .filter(field => field.fieldClass === common.FieldClassEnum.Dimension)
      .filter(f => mconfig.select.indexOf(`${f.name}`) > -1);

    let selectedMeasures = (storeModel.content as common.FileStore).fields
      .filter(field => field.fieldClass === common.FieldClassEnum.Measure)
      .filter(f => mconfig.select.indexOf(`${f.name}`) > -1);

    let orderByElements: {
      fieldId: string;
      field: common.FieldAny;
      desc: boolean;
    }[] = [];

    mconfig.sortings.forEach(sorting => {
      let orderByElement = {
        fieldId: sorting.fieldId,
        field: (storeModel.content as common.FileStore).fields.find(
          field => `${field.name}` === sorting.fieldId
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
      } else if (reference === 'METRICS_DATE_FROM') {
        target = common.isDefined(metricsStartDateYYYYMMDD)
          ? metricsStartDateYYYYMMDD
          : getYYYYMMDDCurrentDateByTimezone({
              timezone: mconfig.timezone
            });
      } else if (reference === 'METRICS_DATE_TO') {
        target = common.isDefined(metricsEndDateYYYYMMDD)
          ? metricsEndDateYYYYMMDD
          : getYYYYMMDDCurrentDateByTimezone({
              timezone: mconfig.timezone
            });
      } else if (reference === 'DATE_TODAY') {
        target = getYYYYMMDDCurrentDateByTimezone({
          timezone: mconfig.timezone
        });
      } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
        target = caseSensitiveStringFilters;
      } else if (reference === 'STORE_FIELDS') {
        target = JSON.stringify(
          (storeModel.content as common.FileStore).fields
        );
      } else if (reference === 'QUERY_TIMEZONE') {
        target = mconfig.timezone;
        // } else if (reference === 'ENV_GA_PROPERTY_ID_1') {
        //   target = '...';
        // } else if (reference === 'ENV_GA_PROPERTY_ID_2') {
        //   target = '...';
      } else {
        refError = `Unknown reference in store.${storeParam}: $${reference}`;
        break;
      }

      inputSub = common.MyRegex.replaceSRefs(inputSub, reference, target);
    }

    if (common.isDefined(refError)) {
      return {
        result: 'Error',
        errorMessage: refError,
        userCode: inputSub
      };
    }

    let userCode = `JSON.stringify((function() {
${inputSub}
})())`;

    let userCodeResult = await this.userCodeService.runOnly({
      userCode: userCode
    });

    return {
      result: userCodeResult.outValue,
      errorMessage: userCodeResult.outError,
      userCode: inputSub
    };
  }

  async transformStoreResponseData(item: {
    input: string;
    storeModel: common.Model;
    respData: any;
  }): Promise<StoreUserCodeReturn> {
    let { input, storeModel, respData } = item;

    // console.log('respData');
    // console.log(respData);

    let inputSub = input;

    let reg = common.MyRegex.CAPTURE_S_REF();
    let r;

    let refError;

    while ((r = reg.exec(inputSub))) {
      let reference = r[1];

      let target: any;

      if (reference === 'RESPONSE_DATA') {
        target = JSON.stringify(respData);
      } else if (reference === 'METRICS_DATE_FROM') {
        target = null;
      } else if (reference === 'METRICS_DATE_TO') {
        target = null;
      } else if (reference === 'DATE_TODAY') {
        target = null;
      } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
        target = null;
      } else if (reference === 'STORE_FIELDS') {
        target = JSON.stringify(
          (storeModel.content as common.FileStore).fields
        );
        // } else if (reference === 'ENV_GA_PROPERTY_ID_1') {
        //   target = '...';
      } else {
        refError = `Unknown reference in store.${common.ParameterEnum.Response}: $${reference}`;
        break;
      }

      inputSub = common.MyRegex.replaceSRefs(inputSub, reference, target);
    }

    // console.log('inputSub');
    // console.log(inputSub);

    if (common.isDefined(refError)) {
      return {
        result: 'Error',
        errorMessage: refError,
        userCode: inputSub
      };
    }

    let userCode = `JSON.stringify((function() {
${inputSub}
})())`;

    let userCodeResult = await this.userCodeService.runOnly({
      userCode: userCode
    });

    return {
      result: userCodeResult.outValue,
      errorMessage: userCodeResult.outError,
      userCode: inputSub
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

    // console.log('queryStart');
    // console.log(queryStart);

    try {
      let body = queryStart.apiBody;

      let url = queryStart.apiUrl;

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

      // console.log('response.data');
      // console.log(response.data);

      // console.log('response.data.rows');
      // console.log(response.data.rows);

      // console.log('response.data.rows[0]');
      // console.log(
      //   response.data.rows.length > 0 ? response.data.rows[0] : undefined
      // );

      let q = await this.db.drizzle.query.queriesTable.findFirst({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      });

      if (common.isDefined(q)) {
        if (response.status !== 200 && response.status !== 201) {
          q.status = common.QueryStatusEnum.Error;
          q.data = [];
          q.queryJobId = undefined; // null
          q.lastErrorMessage = `response status code "${response.code}" is not 200 or 201`;
          q.lastErrorTs = makeTsNumber();
        } else if (common.isUndefined(response.data)) {
          q.status = common.QueryStatusEnum.Error;
          q.data = [];
          q.queryJobId = undefined; // null
          q.lastErrorMessage = `response has no data`;
          q.lastErrorTs = makeTsNumber();
        } else {
          let model = await this.db.drizzle.query.modelsTable.findFirst({
            where: and(
              eq(modelsTable.modelId, q.storeModelId),
              eq(modelsTable.structId, q.storeStructId)
            )
          });

          let dataResult = await this.transformStoreResponseData({
            input: (model.content as common.FileStore).response,
            storeModel: model,
            respData: response.data
          });

          if (common.isDefined(dataResult.errorMessage)) {
            q.status = common.QueryStatusEnum.Error;
            q.data = [];
            q.queryJobId = undefined; // null
            q.lastErrorMessage = `store response data processing Error: ${dataResult.errorMessage}`;
            q.lastErrorTs = makeTsNumber();
          } else {
            q.status = common.QueryStatusEnum.Completed;
            q.queryJobId = undefined; // null;
            q.data = dataResult.result || [];
            q.lastCompleteTs = makeTsNumber();
            q.lastCompleteDuration = Math.floor(
              (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
            );
          }
        }

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
      // console.log('errr:');
      // console.log(e);

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
        q.lastErrorMessage = common.isDefined(e?.response?.data)
          ? e.message + JSON.stringify(e?.response?.data)
          : e.message;
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
