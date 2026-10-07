import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { SearchDwhSchemaFieldNamesService } from '#backend/services/explorer/tools/search-model-fields/search-dwh-schema-field-names/search-dwh-schema-field-names.service';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendSeedRecordsRequest } from '#common/types/backend/routes/test-routes/seed-records/seed-records-request';

let testId = 'search-dwh-schema-field-names__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let seedProjectId = 't1';
let projectId = makeId();
let projectName = testId;

let connectionId = 'c1_postgres';
let envId = PROJECT_ENV_PROD;
let modelId = makeId();

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (_bail: any) => {
    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email],
          orgIds: [orgId],
          projectIds: [projectId],
          projectNames: [projectName]
        },
        seedRecordsPayload: {
          users: [
            {
              userId: userId,
              email: email,
              password: password,
              isEmailVerified: true
            }
          ],
          orgs: [
            {
              orgId: orgId,
              ownerEmail: email,
              name: orgName
            }
          ],
          projects: [
            {
              orgId: orgId,
              projectId: projectId,
              seedProjectId: seedProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: 'Managed'
            }
          ],
          members: [
            {
              memberId: userId,
              email: email,
              projectId: projectId,
              isAdmin: true,
              isEditor: true,
              isExplorer: true
            }
          ],
          connections: [
            {
              projectId: projectId,
              envId: envId,
              connectionId: connectionId,
              type: 'PostgreSQL',
              options: {},
              rawSchema: {
                lastRefreshedTs: Date.now(),
                tables: [
                  {
                    schemaName: 'public',
                    tableName: 'orders',
                    tableType: 'BASE TABLE',
                    columns: [
                      {
                        columnName: 'order_id',
                        dataType: 'integer',
                        isNullable: false,
                        foreignKeys: []
                      },
                      {
                        columnName: 'status',
                        dataType: 'text',
                        isNullable: true,
                        foreignKeys: []
                      }
                    ],
                    indexes: []
                  }
                ]
              }
            }
          ]
        }
      });

      let bridgesService = prep.moduleRef.get<BridgesService>(BridgesService);

      let bridge = await bridgesService.getBridgeCheckExists({
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: envId
      });

      let seedLeafsReq: ToBackendSeedRecordsRequest = {
        operation: 'seedRecords',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          modelFieldLeafs: [
            {
              structId: bridge.structId,
              modelId: modelId,
              modelType: 'Malloy',
              connectionId: connectionId,
              fieldId: 'order_status',
              schemaNameLc: 'public',
              tableNameLc: 'orders',
              columnNameLc: 'status'
            }
          ]
        }
      };

      await sendToBackend({
        route: 'api/ToBackendSeedRecords',
        httpServer: prep.httpServer,
        req: seedLeafsReq,
        checkIsOk: true
      });

      let svc = prep.moduleRef.get<SearchDwhSchemaFieldNamesService>(
        SearchDwhSchemaFieldNamesService
      );

      let matches = await svc.search({
        userId: userId,
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: envId,
        structId: bridge.structId,
        searchFieldNames: ['status'],
        modelIds: [modelId]
      });

      await prep.app.close();

      assert.equal(matches.length, 1);
      assert.equal(matches[0].modelId, modelId);
      assert.equal(matches[0].fieldId, 'order_status');
      assert.equal(matches[0].matchedByNames.length, 1);
      assert.equal(matches[0].matchedByNames[0].searchFieldName, 'status');
      assert.ok(
        matches[0].matchedByNames[0].matchedOn.includes('dwhColumnName')
      );

      isPass = true;
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
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
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
