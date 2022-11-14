import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-create-connection__connection-already-exists';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let connectionId = 'c1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateConnectionResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email],
        orgIds: [orgId],
        projectIds: [projectId],
        projectNames: [projectName]
      },
      seedRecordsPayload: {
        users: [
          {
            userId,
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ],
        orgs: [
          {
            orgId,
            name: orgName,
            ownerEmail: email
          }
        ],
        projects: [
          {
            orgId,
            projectId,
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MASTER
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ],
        connections: [
          {
            connectionId: connectionId,
            envId: common.PROJECT_ENV_PROD,
            projectId: projectId,
            type: common.ConnectionTypeEnum.PostgreSQL
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateConnectionRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateConnection,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        connectionId: connectionId,
        envId: common.PROJECT_ENV_PROD,
        projectId: projectId,
        type: common.ConnectionTypeEnum.PostgreSQL
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendCreateConnectionResponse>(
        {
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: req
        }
      );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger
    });
  }

  t.is(
    resp.info.error.message,
    common.ErEnum.BACKEND_CONNECTION_ALREADY_EXISTS
  );
});
