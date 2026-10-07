import { BackendConfig } from '#backend/config/backend-config';
import { prepareSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-seed/prepare-seed';
import { prepareTest } from '#backend/functions/top/prepare-test-and-seed/prepare-test/prepare-test';
import { Prep } from '#backend/interfaces/prep';
import type { ToBackendDeleteRecordsRequest } from '#common/types/backend/routes/test-routes/delete-records/delete-records-request';
import type { ToBackendSeedRecordsRequest } from '#common/types/backend/routes/test-routes/seed-records/seed-records-request';
import type { ToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';
export async function prepareTestAndSeed(item: {
  traceId: string;
  seedRecordsPayload?: ToBackendSeedRecordsRequest['input'];
  deleteRecordsPayload?: ToBackendDeleteRecordsRequest['input'];
  overrideConfigOptions?: Partial<BackendConfig>;
  loginUserPayload?: ToBackendLoginUserRequest['input'];
}) {
  let {
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    overrideConfigOptions,
    loginUserPayload
  } = item;
  let prep1: Prep = await prepareTest({
    overrideConfigOptions: overrideConfigOptions
  });
  let prepareSeedResult;
  try {
    prepareSeedResult = await prepareSeed({
      httpServer: prep1.httpServer,
      traceId,
      seedRecordsPayload,
      deleteRecordsPayload,
      loginUserPayload
    });
  } catch (e) {
    await prep1.app.close();
    throw e;
  }
  let prep2: Prep = {
    loginToken: prepareSeedResult.loginToken,
    app: prep1.app,
    httpServer: prep1.httpServer,
    moduleRef: prep1.moduleRef,
    rpcService: prep1.rpcService,
    tabToEntService: prep1.tabToEntService,
    logger: prep1.logger,
    cs: prep1.cs
  };
  return prep2;
}
