import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { getYYYYMMDDCurrentDateByTimezone } from '#backend/functions/get-yyyymmdd-current-date-by-timezone/get-yyyymmdd-current-date-by-timezone';
import { runOnly } from '#backend/functions/user-code/run-only/run-only';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';

export type StoreUserCodeReturn = {
  userCode: string;
  result: string;
  errorMessage: string;
};

export async function transformStoreRequest(item: {
  input: string;
  mconfig: MconfigTab;
  storeModel: ModelTab;
  storeParam: FileParameter;
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

  let reg: RegExp = MyRegex.CAPTURE_S_REF();

  let r;

  let refError;

  let selectedDimensions: FieldAny[] = storeModel.storeContent.fields
    .filter(field => field.fieldClass === 'dimension')
    .filter(f => mconfig.select.indexOf(`${f.name}`) > -1);

  let selectedMeasures: FieldAny[] = storeModel.storeContent.fields
    .filter(field => field.fieldClass === 'measure')
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

  let userCodeResult: any = await runOnly({
    userCode: userCode
  });

  return {
    result: userCodeResult.outValue,
    errorMessage: userCodeResult.outError,
    userCode: inputSub
  };
}
