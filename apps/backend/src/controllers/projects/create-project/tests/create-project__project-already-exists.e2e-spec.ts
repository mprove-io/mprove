import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'create-project__project-already-exists';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let orgName = testId;
let orgId = common.makeId();
let projectName = testId;
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateProjectResponse;

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
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ],
        orgs: [
          {
            orgId: orgId,
            name: orgName,
            ownerEmail: email
          }
        ],
        projects: [
          {
            orgId,
            name: projectName
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateProjectRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        name: projectName
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendCreateProjectResponse>(
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
    apiToBackend.ErEnum.BACKEND_PROJECT_ALREADY_EXISTS
  );
});
