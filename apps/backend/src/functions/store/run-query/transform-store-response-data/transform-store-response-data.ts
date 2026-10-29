import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import type { StoreUserCodeReturn } from '#backend/functions/db/mconfigs/prep-store-mconfig-query/transform-store-request/transform-store-request';
import { runOnly } from '#backend/functions/user-code/run-only/run-only';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';

export async function transformStoreResponseData(item: {
  storeModel: ModelTab;
  respData: any;
}): Promise<StoreUserCodeReturn> {
  let { storeModel, respData } = item;

  let store = storeModel.storeContent;

  let inputSub = store.response;

  let reg: RegExp = MyRegex.CAPTURE_S_REF();

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
      refError = `Unknown reference in store.${'response' satisfies FileParameter}: $${reference}`;

      break;
    }

    inputSub = MyRegex.replaceSRefs(inputSub, reference, target);
  }

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

    let userCodeResult: any = await runOnly({
      userCode: userCode
    });

    dataResult = {
      result: userCodeResult.outValue,
      errorMessage: userCodeResult.outError,
      userCode: inputSub
    };
  }

  return dataResult;
}
