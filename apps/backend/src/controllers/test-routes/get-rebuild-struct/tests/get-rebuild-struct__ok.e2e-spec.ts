import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToBackendGetRebuildStructRequest } from '#common/zod/to-backend/test-routes/to-backend-get-rebuild-struct';
import type { ToBlockmlRebuildStructResponse } from '#common/zod/to-blockml/api/to-blockml-rebuild-struct';
import type {
  ToDiskSeedProjectRequest,
  ToDiskSeedProjectResponse
} from '#common/zod/to-disk/08-seed/to-disk-seed-project';

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

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
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

      let projectSt: ProjectSt = {
        name: projectName
      };

      let projectLt: ProjectLt = {
        defaultBranch: BRANCH_MAIN,
        gitUrl: undefined,
        publicKey: undefined,
        privateKey: undefined,
        publicKeyEncrypted: undefined,
        privateKeyEncrypted: undefined,
        passPhrase: undefined
      };

      let baseProject: BaseProject = {
        orgId: orgId,
        projectId: projectId,
        remoteType: ProjectRemoteTypeEnum.Managed,
        st: prep.tabToEntService.encrypt({ data: projectSt }),
        lt: prep.tabToEntService.encrypt({ data: projectLt })
      };

      let toDiskSeedProjectReq: ToDiskSeedProjectRequest = {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskSeedProject,
          traceId: traceId
        },
        payload: {
          orgId: orgId,
          baseProject: baseProject,
          testProjectId: testProjectId,
          devRepoId: devRepoId,
          userAlias: userAlias
        }
      };

      await prep.rpcService.sendToDisk<ToDiskSeedProjectResponse>({
        checkIsOk: true,
        orgId: orgId,
        projectId: null,
        repoId: null,
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
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
