import test from 'ava';
import { BRANCH_MAIN } from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ToDiskGetFileRequest } from '#common/zod/disk/routes/files/get-file/get-file-request';
import type { ToDiskGetFileResponse } from '#common/zod/disk/routes/files/get-file/get-file-response';
import type { ToDiskCreateOrgRequest } from '#common/zod/disk/routes/orgs/create-org/create-org-request';
import type { ToDiskCreateProjectRequest } from '#common/zod/disk/routes/projects/create-project/create-project-request';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { logToConsoleDisk } from '#disk/functions/top/log-to-console-disk/log-to-console-disk';
import { prepareTest } from '#disk/functions/top/prepare-test/prepare-test';

let testId = 'disk-get-file__path-traversal';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskGetFileResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, diskTabService, logger, cs } = await prepareTest(
      orgId,
      { diskLogResponseError: false }
    );
    wLogger = logger;
    configService = cs;

    let createOrgRequest: ToDiskCreateOrgRequest = {
      operation: 'createOrg',
      traceId: traceId,
      input: {
        orgId: orgId
      }
    };

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
      st: diskTabService.encrypt({ data: projectSt }),
      lt: diskTabService.encrypt({ data: projectLt })
    };

    let createProjectRequest: ToDiskCreateProjectRequest = {
      operation: 'createProject',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        devRepoId: 'r1',
        userAlias: 'u1'
      }
    };

    let getFileRequest: ToDiskGetFileRequest = {
      operation: 'getFile',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/../../etc/passwd`,
        builderLeft: BuilderLeftEnum.Tree
      }
    };

    await messageService.processRequest({ request: createOrgRequest });
    await messageService.processRequest({ request: createProjectRequest });

    resp = await messageService.processRequest({ request: getFileRequest });
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp.result.type, 'Failure');

  if (resp.result.type !== 'Failure') {
    return;
  }

  t.is(resp.result.error.code, 'DISK_PATH_TRAVERSAL');
});
