import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-get-project__project-does-not-exist';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetProjectResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId]
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
        ]
        // ,
        // projects: [
        //   {
        //     orgId,
        //     projectId,
        //     name: projectName
        //   }
        // ],
        // members: [
        //   {
        //     memberId: userId,
        //     email,
        //     projectId,
        //     isAdmin: common.BoolEnum.FALSE,
        //     isEditor: common.BoolEnum.TRUE,
        //     isExplorer: common.BoolEnum.TRUE
        //   }
        // ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendGetProjectRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        traceId: traceId
      },
      payload: {
        projectId: projectId
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendGetProjectResponse>(
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

  t.is(
    resp.info.error.message,
    apiToBackend.ErEnum.BACKEND_PROJECT_DOES_NOT_EXIST
  );
});
