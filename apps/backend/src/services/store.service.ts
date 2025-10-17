import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ConnectionTab,
  MconfigTab,
  ModelTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { StoreMethodEnum } from '~common/enums/store-method.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { Filter } from '~common/interfaces/blockml/filter';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FieldAny } from '~common/interfaces/blockml/internal/field-any';
import { MyRegex } from '~common/models/my-regex';
import { getYYYYMMDDCurrentDateByTimezone } from '~node-common/functions/get-yyyymmdd-current-date-by-timezone';
import { TabService } from './tab.service';
import { UserCodeService } from './user-code.service';

let retry = require('async-retry');
let axios = require('axios');

export interface StoreUserCodeReturn {
  userCode: string;
  result: string;
  errorMessage: string;
}

@Injectable()
export class StoreService {
  constructor(
    private tabService: TabService,
    private userCodeService: UserCodeService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async adjustMconfig(item: {
    mconfig: MconfigTab;
    model: ModelTab;
    caseSensitiveStringFilters: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }): Promise<MconfigTab> {
    let {
      model,
      mconfig,
      caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD
    } = item;

    // console.log('item.metricsStartDateYYYYMMDD');
    // console.log(item.metricsStartDateYYYYMMDD);
    // console.log('item.metricsEndDateYYYYMMDD');
    // console.log(item.metricsEndDateYYYYMMDD);

    let newMconfig = makeCopy(mconfig);

    newMconfig.mconfigId = makeId();

    //
    newMconfig.dateRangeIncludesRightSide =
      isUndefined(model.storeContent.date_range_includes_right_side) ||
      toBooleanFromLowercaseString(
        model.storeContent.date_range_includes_right_side
      ) === true
        ? true
        : false;

    // add required filters
    model.storeContent.fields
      .filter(x => x.fieldClass === FieldClassEnum.Filter)
      .forEach(storeFilter => {
        if (toBooleanFromLowercaseString(storeFilter.required) === true) {
          let selectedFilter = newMconfig.filters.find(
            x => x.fieldId === `${storeFilter.name}`
          );

          if (isUndefined(selectedFilter)) {
            let newFraction: Fraction = {
              type: FractionTypeEnum.StoreFraction,
              controls: [] as any[],
              brick: undefined as any,
              operator: undefined as any
            };

            let newFilter: Filter = {
              fieldId: `${storeFilter.name}`,
              fractions: [newFraction]
            };

            newMconfig.filters.push(newFilter);

            selectedFilter = newFilter;
          }

          storeFilter.fraction_controls.forEach(storeFractionControl => {
            let selectedControl = selectedFilter.fractions[0].controls.find(
              x => x.name === storeFractionControl.name
            );

            if (isUndefined(selectedControl)) {
              let newControl: FractionControl = {
                isMetricsDate: storeFractionControl.isMetricsDate,
                options: storeFractionControl.options,
                value: storeFractionControl.value,
                label: storeFractionControl.label,
                required: storeFractionControl.required,
                name: storeFractionControl.name,
                controlClass: storeFractionControl.controlClass
              };

              selectedFilter.fractions[0].controls.push(newControl);
            }
          });
        }
      });

    // console.log('newMconfig.filters');
    // console.log(newMconfig.filters);

    newMconfig.filters.forEach(filter => {
      // console.log('filter.fieldId');
      // console.log(filter.fieldId);

      if (isUndefined(filter.fieldId)) {
        // console.log('___filter___');
        // console.log(filter);
      }

      filter.fractions.forEach(fraction => {
        // console.log('fraction');
        // console.log(fraction);

        fraction.controls
          .filter(
            control =>
              isDefinedAndNotEmpty(control.value) &&
              typeof control.value === 'string'
          )
          .forEach(control => {
            // console.log('control');
            // console.log(control);

            let storeFilt = model.storeContent.fields
              .filter(
                storeField => storeField.fieldClass === FieldClassEnum.Filter
              )
              .find(storeField => storeField.name === filter.fieldId);

            // console.log('storeFilt');
            // console.log(storeFilt);

            let newValue =
              control.isMetricsDate === true &&
              (isDefined(metricsStartDateYYYYMMDD) ||
                isDefined(metricsEndDateYYYYMMDD))
                ? storeFilt.fraction_controls.find(
                    fc => fc.name === control.name
                  ).value
                : control.value;

            let reg = MyRegex.CAPTURE_S_REF();
            let r;

            // let refError;

            while ((r = reg.exec(newValue))) {
              let reference = r[1];

              let target: any;

              if (
                reference === 'METRICS_DATE_FROM' &&
                control.controlClass === ControlClassEnum.DatePicker
              ) {
                target = isDefined(metricsStartDateYYYYMMDD)
                  ? metricsStartDateYYYYMMDD
                  : getYYYYMMDDCurrentDateByTimezone({
                      timezone: mconfig.timezone,
                      deltaDays: -1
                    });
              } else if (
                reference === 'METRICS_DATE_TO' &&
                control.controlClass === ControlClassEnum.DatePicker
              ) {
                target = isDefined(metricsEndDateYYYYMMDD)
                  ? metricsEndDateYYYYMMDD
                  : getYYYYMMDDCurrentDateByTimezone({
                      timezone: mconfig.timezone,
                      deltaDays: 1
                    });
              } else if (reference === 'DATE_TODAY') {
                target = getYYYYMMDDCurrentDateByTimezone({
                  timezone: mconfig.timezone,
                  deltaDays: 0
                });
              } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
                target = caseSensitiveStringFilters;
              } else {
                target = null;
                // refError = `Unknown reference in store.${storeParam}: $${reference}`;
                // break;
              }

              newValue = MyRegex.replaceSRefs(newValue, reference, target);
            }

            control.value =
              control.controlClass === ControlClassEnum.Switch &&
              typeof newValue === 'string'
                ? toBooleanFromLowercaseString(newValue)
                : newValue;
            // console.log('control.value');
            // console.log(control.value);
          });
      });
    });

    let addSelect: string[] = [];

    model.storeContent.fields
      .filter(
        storeField =>
          storeField.fieldClass !== FieldClassEnum.Filter &&
          toBooleanFromLowercaseString(storeField.required) === true
      )
      .forEach(field => {
        if (newMconfig.select.indexOf(field.name) < 0) {
          addSelect.push(field.name);
        }
      });

    newMconfig.select = [...newMconfig.select, ...addSelect];

    return newMconfig;
  }

  async transformStoreRequest(item: {
    input: string;
    mconfig: MconfigTab;
    storeModel: ModelTab;
    storeParam: ParameterEnum;
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

    let reg = MyRegex.CAPTURE_S_REF();
    let r;

    let refError;

    let selectedDimensions = storeModel.storeContent.fields
      .filter(field => field.fieldClass === FieldClassEnum.Dimension)
      .filter(f => mconfig.select.indexOf(`${f.name}`) > -1);

    let selectedMeasures = storeModel.storeContent.fields
      .filter(field => field.fieldClass === FieldClassEnum.Measure)
      .filter(f => mconfig.select.indexOf(`${f.name}`) > -1);

    let orderByElements: {
      fieldId: string;
      field: FieldAny;
      desc: boolean;
    }[] = [];

    mconfig.sortings.forEach(sorting => {
      let orderByElement = {
        fieldId: sorting.fieldId,
        field: storeModel.storeContent.fields.find(
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
        target = isDefined(metricsStartDateYYYYMMDD)
          ? metricsStartDateYYYYMMDD
          : getYYYYMMDDCurrentDateByTimezone({
              timezone: mconfig.timezone,
              deltaDays: -1
            });
      } else if (reference === 'METRICS_DATE_TO') {
        target = isDefined(metricsEndDateYYYYMMDD)
          ? metricsEndDateYYYYMMDD
          : getYYYYMMDDCurrentDateByTimezone({
              timezone: mconfig.timezone,
              deltaDays: 1
            });
      } else if (reference === 'DATE_TODAY') {
        target = getYYYYMMDDCurrentDateByTimezone({
          timezone: mconfig.timezone,
          deltaDays: 0
        });
      } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
        target = caseSensitiveStringFilters;
      } else if (reference === 'STORE_FIELDS') {
        target = JSON.stringify(storeModel.storeContent.fields);
      } else if (reference === 'QUERY_TIMEZONE') {
        target = mconfig.timezone;
      } else {
        refError = `Unknown reference in store.${storeParam}: $${reference}`;
        break;
      }

      inputSub = MyRegex.replaceSRefs(inputSub, reference, target);
    }

    if (isDefined(refError)) {
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
    storeModel: ModelTab;
    respData: any;
  }): Promise<StoreUserCodeReturn> {
    let { storeModel, respData } = item;

    // console.log('respData');
    // console.log(respData);

    let store = storeModel.storeContent;

    let inputSub = store.response;

    let reg = MyRegex.CAPTURE_S_REF();
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
        target = JSON.stringify(store.fields);
      } else {
        refError = `Unknown reference in store.${ParameterEnum.Response}: $${reference}`;
        break;
      }

      inputSub = MyRegex.replaceSRefs(inputSub, reference, target);
    }

    // console.log('inputSub');
    // console.log(inputSub);

    let dataResult: StoreUserCodeReturn;

    if (isDefined(refError)) {
      dataResult = {
        result: 'Error',
        errorMessage: refError,
        userCode: inputSub
      };
    } else {
      let userCode = `JSON.stringify((function() {
        ${inputSub}
        })())`;

      let userCodeResult = await this.userCodeService.runOnly({
        userCode: userCode
      });

      dataResult = {
        result: userCodeResult.outValue,
        errorMessage: userCodeResult.outError,
        userCode: inputSub
      };
    }

    // console.log('dataResult');
    // console.log(dataResult);

    return dataResult;
  }

  async runQuery(item: {
    projectId: string;
    connection: ConnectionTab;
    model: ModelTab;
    queryId: string;
    queryJobId: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, projectId, model } = item;

    // console.log('store runQuery start');
    // let tsStart = Date.now();

    let queryStart = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    try {
      let body = queryStart.apiBody;

      let url = queryStart.apiUrl;

      let headers: any = {};

      let response;

      if (connection.type === ConnectionTypeEnum.Api) {
        connection.options.storeApi.headers.forEach(header => {
          headers[header.key] = header.value;
        });
      } else if (connection.type === ConnectionTypeEnum.GoogleApi) {
        connection.options.storeGoogleApi.headers.forEach(header => {
          headers[header.key] = header.value;
        });

        headers['Authorization'] =
          `Bearer ${connection.options.storeGoogleApi.googleAccessToken}`;

        headers['Content-Type'] = 'application/json';
      }

      response =
        queryStart.apiMethod === StoreMethodEnum.Post
          ? await axios.post(url, body, { headers: headers })
          : queryStart.apiMethod === StoreMethodEnum.Get
            ? await axios.get(url, body, { headers: headers })
            : { message: 'method must be POST or GET' };

      // console.log(Date.now() - tsStart);
      // console.log('store runquery end');

      // console.log('response.data');
      // console.log(response.data);

      // console.log('response.data.rows');
      // console.log(response.data.rows);

      // console.log('response.data.rows[0]');
      // console.log(
      //   response.data.rows.length > 0 ? response.data.rows[0] : undefined
      // );

      let q = await this.db.drizzle.query.queriesTable
        .findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        })
        .then(x => this.tabService.queryEntToTab(x));

      if (isDefined(q)) {
        if (response.status !== 200 && response.status !== 201) {
          q.status = QueryStatusEnum.Error;
          q.data = [];
          q.queryJobId = undefined; // null
          q.lastErrorMessage = `response status code "${response.code}" is not 200 or 201`;
          q.lastErrorTs = makeTsNumber();
        } else if (isUndefined(response.data)) {
          q.status = QueryStatusEnum.Error;
          q.data = [];
          q.queryJobId = undefined; // null
          q.lastErrorMessage = `response has no data`;
          q.lastErrorTs = makeTsNumber();
        } else {
          let dataResult: StoreUserCodeReturn =
            await this.transformStoreResponseData({
              storeModel: model,
              respData: response.data
            });

          if (isDefined(dataResult.errorMessage)) {
            q.status = QueryStatusEnum.Error;
            q.data = [];
            q.queryJobId = undefined; // null
            q.lastErrorMessage = `store response data processing Error: ${dataResult.errorMessage}`;
            q.lastErrorTs = makeTsNumber();
          } else {
            q.status = QueryStatusEnum.Completed;
            q.queryJobId = undefined; // null;
            q.data = isDefined(dataResult.result)
              ? JSON.parse(dataResult.result) || []
              : [];
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

      let q = await this.db.drizzle.query.queriesTable
        .findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        })
        .then(x => this.tabService.queryEntToTab(x));

      if (isDefined(q)) {
        q.status = QueryStatusEnum.Error;
        q.data = [];
        q.queryJobId = undefined; // null
        q.lastErrorMessage = isDefined(e?.response?.data)
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
