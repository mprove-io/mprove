import test from 'ava';
import crypto from 'crypto';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { makeIdPrefix } from '#common/functions/make-id-prefix';
import {
  ToBackendCommitRepoRequest,
  ToBackendCommitRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-commit-repo';

let testId = 'backend-jwt-auth-guard__session-key-request-not-allowed';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let sessionId = makeId();
let sessionApiKey = `${ApiKeyTypeEnum.SK}-${makeIdPrefix()}-${sessionId.toUpperCase()}-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendCommitRepoResponse;

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
        sessions: [
          {
            sessionId: sessionId,
            userId: userId,
            projectId: projectId,
            apiKey: sessionApiKey,
            status: SessionStatusEnum.Archived,
            type: SessionTypeEnum.Editor
          }
        ]
      }
    });

    // not session-allowed
    let commitReq: ToBackendCommitRepoRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        repoId: sessionId,
        branchId: BRANCH_MAIN,
        commitMessage: 'test commit'
      }
    };

    resp = await sendToBackend<ToBackendCommitRepoResponse>({
      httpServer: prep.httpServer,
      apiKey: sessionApiKey,
      req: commitReq
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

  t.is(resp.info.status, ResponseInfoStatusEnum.Error);
  t.is(
    resp.info.error.message,
    ErEnum.BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED
  );
});
