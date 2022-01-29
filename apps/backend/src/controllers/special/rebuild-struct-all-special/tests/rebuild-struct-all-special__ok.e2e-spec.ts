import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-rebuild-struct-all-special__ok';

let traceId = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendRebuildStructAllSpecialResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId]
      }
    });

    // to backend

    let rebuildStructAllSpecialReq: apiToBackend.ToBackendRebuildStructAllSpecialRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendRebuildStructAllSpecial,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        specialKey: '123'
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendRebuildStructAllSpecialResponse>(
      {
        httpServer: prep.httpServer,
        req: rebuildStructAllSpecialReq
      }
    );

    common.logToConsole(resp.payload);

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
