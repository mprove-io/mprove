import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '~common/constants/top';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { Project } from '~common/interfaces/backend/project';
import { ToBackendGetRebuildStructRequest } from '~common/interfaces/to-backend/test-routes/to-backend-get-rebuild-struct';
import { ToBlockmlRebuildStructResponse } from '~common/interfaces/to-blockml/api/to-blockml-rebuild-struct';
import {
  ToDiskSeedProjectRequest,
  ToDiskSeedProjectResponse
} from '~common/interfaces/to-disk/08-seed/to-disk-seed-project';

let testId = 'get-rebuild-struct__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't2';
let projectId = makeId();
let projectName = testId;

let devRepoId = userId;
let userAlias = testId;

let envId = PROJECT_ENV_PROD;

let prep: Prep;

test('1', async t => {
  let resp: ToBlockmlRebuildStructResponse;

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
        ]
      }
    });

    // to disk

    let apiProject: Project = {
      orgId: orgId,
      projectId: projectId,
      name: projectName,
      defaultBranch: BRANCH_MAIN,
      remoteType: ProjectRemoteTypeEnum.Managed,
      gitUrl: undefined,
      tab: {
        privateKey: undefined,
        publicKey: undefined
      },
      serverTs: 0
    };

    let toDiskSeedProjectReq: ToDiskSeedProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSeedProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        project: apiProject,
        testProjectId: testProjectId,
        devRepoId: devRepoId,
        userAlias: userAlias
      }
    };

    await prep.rabbitService.sendToDisk<ToDiskSeedProjectResponse>({
      checkIsOk: true,
      routingKey: makeRoutingKeyToDisk({
        orgId: orgId,
        projectId: null
      }),
      message: toDiskSeedProjectReq
    });

    // to backend

    let getRebuildStructReq: ToBackendGetRebuildStructRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: devRepoId,
        branch: BRANCH_MAIN,
        envId: envId,
        overrideTimezone: undefined,
        isUseCache: false,
        cachedModels: [],
        cachedMetrics: []
      }
    };

    resp = await sendToBackend<ToBlockmlRebuildStructResponse>({
      httpServer: prep.httpServer,
      req: getRebuildStructReq
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
