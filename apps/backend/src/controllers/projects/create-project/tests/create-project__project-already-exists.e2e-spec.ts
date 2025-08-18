import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-create-project__project-already-exists';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateProjectResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId],
        projectNames: [projectName]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
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
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MAIN
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateProjectRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        orgId: orgId,
        name: projectName,
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendCreateProjectResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_PROJECT_ALREADY_EXISTS);
});
