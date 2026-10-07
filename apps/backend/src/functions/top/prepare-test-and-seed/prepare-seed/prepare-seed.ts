import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendDeleteRecordsRequest } from '#common/types/backend/routes/test-routes/delete-records/delete-records-request';
import type { ToBackendSeedRecordsRequest } from '#common/types/backend/routes/test-routes/seed-records/seed-records-request';
import type { ToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';
import type { ToBackendLoginUserResponse } from '#common/types/backend/routes/users/login-user/login-user-response';
export async function prepareSeed(item: {
  httpServer: any;
  traceId: string;
  seedRecordsPayload?: ToBackendSeedRecordsRequest['input'];
  deleteRecordsPayload?: ToBackendDeleteRecordsRequest['input'];
  loginUserPayload?: ToBackendLoginUserRequest['input'];
}) {
  let {
    httpServer,
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    loginUserPayload
  } = item;
  if (isDefined(deleteRecordsPayload)) {
    let deleteRecordsRequest: ToBackendDeleteRecordsRequest = {
      operation: 'deleteRecords',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: deleteRecordsPayload
    };
    await sendToBackend({
      route: 'api/ToBackendDeleteRecords',
      checkIsOk: true,
      httpServer: httpServer,
      req: deleteRecordsRequest
    }).catch(e => {
      throw e;
    });
  }
  if (isDefined(seedRecordsPayload)) {
    let seedRecordsRequest: ToBackendSeedRecordsRequest = {
      operation: 'seedRecords',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: seedRecordsPayload
    };
    await sendToBackend({
      route: 'api/ToBackendSeedRecords',
      checkIsOk: true,
      httpServer: httpServer,
      req: seedRecordsRequest
    }).catch(e => {
      throw e;
    });
  }
  let loginUserResp: ToBackendLoginUserResponse;
  if (isDefined(loginUserPayload)) {
    let loginUserRequest: ToBackendLoginUserRequest = {
      operation: 'loginUser',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: loginUserPayload
    };
    loginUserResp = (await sendToBackend({
      route: 'api/ToBackendLoginUser',
      checkIsOk: true,
      httpServer: httpServer,
      req: loginUserRequest
    }).catch(e => {
      console.log(e);
      throw e;
    })) as ToBackendLoginUserResponse;
  }
  return {
    loginToken:
      loginUserResp?.type === 'Success' ? loginUserResp.output.token : undefined
  };
}
