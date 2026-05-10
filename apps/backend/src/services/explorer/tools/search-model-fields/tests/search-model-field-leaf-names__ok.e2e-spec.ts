import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import type { Prep } from '#backend/interfaces/prep';
import { SearchModelFieldLeafNamesService } from '#backend/services/explorer/tools/search-model-fields/search-model-field-leaf-names.service';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { makeId } from '#common/functions/make-id';

let testId = 'search-model-field-leaf-names__ok';

let traceId = testId;

let structId = makeId();
let modelId = makeId();

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (_bail: any) => {
    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          structIds: [structId]
        },
        seedRecordsPayload: {
          modelFieldLeafs: [
            {
              structId: structId,
              modelId: modelId,
              modelType: ModelTypeEnum.Malloy,
              fieldId: 'order_status',
              fieldNameLc: 'order_status',
              labelLc: 'order status',
              descriptionLc: 'lifecycle state of the order'
            },
            {
              structId: structId,
              modelId: modelId,
              modelType: ModelTypeEnum.Malloy,
              fieldId: 'cust_id',
              fieldNameLc: 'cust_id',
              descriptionLc: 'identifier of the customer placing the order'
            },
            {
              structId: structId,
              modelId: modelId,
              modelType: ModelTypeEnum.Malloy,
              fieldId: 'created_at',
              fieldNameLc: 'created_at',
              labelLc: 'created at'
            }
          ]
        }
      });

      let svc = prep.moduleRef.get<SearchModelFieldLeafNamesService>(
        SearchModelFieldLeafNamesService
      );

      let matches = await svc.search({
        structId: structId,
        searchFieldNames: ['order'],
        modelIds: [modelId]
      });

      await prep.app.close();

      assert.equal(matches.length, 2);

      let orderStatus = matches.find(x => x.fieldId === 'order_status');
      assert.ok(orderStatus);
      assert.equal(orderStatus.matchedByNames.length, 1);
      assert.equal(orderStatus.matchedByNames[0].searchFieldName, 'order');
      assert.deepEqual(
        [...orderStatus.matchedByNames[0].matchedOn].sort(),
        ['description', 'fieldId', 'fieldName', 'label'].sort()
      );

      let custId = matches.find(x => x.fieldId === 'cust_id');
      assert.ok(custId);
      assert.equal(custId.matchedByNames.length, 1);
      assert.deepEqual(custId.matchedByNames[0].matchedOn, ['description']);

      isPass = true;
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
      throw e;
    }
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
