import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import type { Prep } from '#backend/interfaces/prep';
import { SearchCachedFieldValuesService } from '#backend/services/explorer/tools/search-model-fields/search-cached-field-values.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { makeId } from '#common/functions/make-id';

let testId = 'search-cached-field-values__ok';

let traceId = testId;

let projectId = makeId();
let structId = makeId();
let modelId = makeId();
let fieldId = 'status_field';
let connectionId = 'conn1';
let envId = PROJECT_ENV_PROD;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (_bail: any) => {
    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          projectIds: [projectId],
          structIds: [structId]
        },
        seedRecordsPayload: {
          cachedColumns: [
            {
              projectId: projectId,
              connectionId: connectionId,
              envId: envId,
              schemaNameLc: 'public',
              tableNameLc: 'orders',
              columnNameLc: 'status',
              status: 'completed',
              limit: 1000,
              startedTs: Date.now()
            }
          ],
          cachedParts: [
            {
              projectId: projectId,
              connectionId: connectionId,
              envId: envId,
              schemaNameLc: 'public',
              tableNameLc: 'orders',
              columnNameLc: 'status',
              columnValue: 'active',
              columnValueLc: 'active',
              count: 42
            },
            {
              projectId: projectId,
              connectionId: connectionId,
              envId: envId,
              schemaNameLc: 'public',
              tableNameLc: 'orders',
              columnNameLc: 'status',
              columnValue: 'Pending',
              columnValueLc: 'pending',
              count: 15
            },
            {
              projectId: projectId,
              connectionId: connectionId,
              envId: envId,
              schemaNameLc: 'public',
              tableNameLc: 'orders',
              columnNameLc: 'status',
              columnValue: 'inactive',
              columnValueLc: 'inactive',
              count: 3
            }
          ],
          modelFieldLeafs: [
            {
              structId: structId,
              modelId: modelId,
              modelType: ModelTypeEnum.Malloy,
              connectionId: connectionId,
              fieldId: fieldId,
              fieldResult: FieldResultEnum.String,
              schemaNameLc: 'public',
              tableNameLc: 'orders',
              columnNameLc: 'status'
            }
          ]
        }
      });

      let svc = prep.moduleRef.get<SearchCachedFieldValuesService>(
        SearchCachedFieldValuesService
      );

      let matches = await svc.search({
        projectId: projectId,
        structId: structId,
        cacheEnvId: envId,
        searchFieldValues: ['act', 'pending'],
        modelIds: [modelId]
      });

      await prep.app.close();

      assert.equal(matches.length, 1);
      assert.equal(matches[0].modelId, modelId);
      assert.equal(matches[0].fieldId, fieldId);
      assert.equal(matches[0].matchedByValues.length, 2);

      let byAct = matches[0].matchedByValues.find(
        x => x.searchFieldValue === 'act'
      );
      assert.ok(byAct);
      assert.deepEqual(
        byAct.matchedValues.map(v => v.value),
        ['active', 'inactive']
      );
      assert.equal(byAct.matchedValues[0].count, 42);
      assert.equal(byAct.matchedValues[1].count, 3);

      let byPending = matches[0].matchedByValues.find(
        x => x.searchFieldValue === 'pending'
      );
      assert.ok(byPending);
      assert.deepEqual(
        byPending.matchedValues.map(v => v.value),
        ['Pending']
      );
      assert.equal(byPending.matchedValues[0].count, 15);

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
