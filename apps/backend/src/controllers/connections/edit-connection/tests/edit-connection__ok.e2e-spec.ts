import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'edit-connection__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let orgName = testId;
let userId = common.makeId();
let orgId = common.makeId();
let projectName = testId;
let projectId = common.makeId();
let connectionId = 'c1';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendEditConnectionResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgNames: [orgName],
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
            name: projectName
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
            projectId: projectId,
            type: common.ConnectionTypeEnum.BigQuery
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendEditConnectionRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditConnection,
        traceId: traceId
      },
      payload: {
        connectionId: connectionId,
        projectId: projectId,
        type: common.ConnectionTypeEnum.PostgreSQL
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendEditConnectionResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
