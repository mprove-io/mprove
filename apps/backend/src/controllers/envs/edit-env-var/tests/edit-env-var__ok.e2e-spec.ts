import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { BRANCH_MAIN } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendEditEnvVarRequest,
  ToBackendEditEnvVarResponse
} from '~common/interfaces/to-backend/envs/to-backend-edit-env-var';

let testId = 'backend-edit-env-var__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let envId = 'env1';

let evId = 'MPROVE_EV1';
let val = '123';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendEditEnvVarResponse;

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
        ],
        projects: [
          {
            orgId,
            projectId,
            name: projectName,
            remoteType: ProjectRemoteTypeEnum.Managed,
            defaultBranch: BRANCH_MAIN
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          }
        ],
        envs: [
          {
            projectId: projectId,
            envId: envId,
            evs: [
              {
                evId: evId,
                val: '1'
              }
            ]
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendEditEnvVarRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendEditEnvVar,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        envId: envId,
        evId: evId,
        val: val
      }
    };

    resp = await sendToBackend<ToBackendEditEnvVarResponse>({
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
