import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'special-rebuild-structs__ok';

let traceId = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSpecialRebuildStructsResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId]
      }
    });

    // to backend

    let specialRebuildStructsReq: apiToBackend.ToBackendSpecialRebuildStructsRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendSpecialRebuildStructs,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        specialKey: '123'
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendSpecialRebuildStructsResponse>(
      {
        httpServer: prep.httpServer,
        req: specialRebuildStructsReq
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
