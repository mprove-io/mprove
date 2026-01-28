import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendCreateProjectRequest,
  ToBackendCreateProjectResponse
} from '#common/interfaces/to-backend/projects/to-backend-create-project';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'backend-create-project__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendCreateProjectResponse;

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
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendCreateProjectRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCreateProject,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId,
        name: projectName,
        remoteType: ProjectRemoteTypeEnum.Managed
      }
    };

    resp = await sendToBackend<ToBackendCreateProjectResponse>({
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

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
});
