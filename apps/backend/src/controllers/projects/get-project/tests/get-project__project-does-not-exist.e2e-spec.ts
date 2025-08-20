import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendGetProjectRequest,
  ToBackendGetProjectResponse
} from '~common/interfaces/to-backend/projects/to-backend-get-project';

let testId = 'backend-get-project__project-does-not-exist';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetProjectResponse;

  try {
    prep = await prepareTestAndSeed({
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
            isEmailVerified: true
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
        //     isAdmin: false,
        //     isEditor: true,
        //     isExplorer: true
        //   }
        // ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendGetProjectRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetProject,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId
      }
    };

    resp = await sendToBackend<ToBackendGetProjectResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error.message, ErEnum.BACKEND_PROJECT_DOES_NOT_EXIST);
});
