import test from 'ava';
import fse from 'fs-extra';
import { BRANCH_MAIN } from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { makeId } from '#common/functions/make-id';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import type { ToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import type { ToDiskGetFileRequest } from '#common/zod/to-disk/07-files/get-file/get-file-request';
import type { ToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import { logToConsoleDisk } from '#disk/functions/log-to-console-disk';
import { prepareTest } from '#disk/functions/prepare-test';

let testId = 'disk-get-file__symlink-escape';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

let secretContent = 'SECRET_A_CONTENT';

test.after.always(async () => {
  let orgPath = process.env.DISK_ORGANIZATIONS_PATH;

  if (isDefinedAndNotEmpty(orgPath)) {
    await fse.remove(`${orgPath}/${orgId}`);
  }
});

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

    await messageService.processRequest({ request: createOrgRequest });
    await messageService.processRequest({ request: createProjectRequest });

    let orgPath = cs.get('diskOrganizationsPath');
    let orgDir = `${orgPath}/${orgId}`;
    let repoDir = `${orgDir}/${projectId}/r1`;
    let secretPath = `${orgDir}/SECRET_A.txt`;
    let symlinkPath = `${repoDir}/leak.view`;

    await fse.writeFile(secretPath, secretContent);
    await fse.symlink(secretPath, symlinkPath);

    let getFileRequest: ToDiskGetFileRequest = {
      operation: 'getFile',
      traceId: traceId,
      input: {
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/leak.view`,
        builderLeft: BuilderLeftEnum.Tree
      }
    };

    resp = await messageService.processRequest({ request: getFileRequest });
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  if (resp.result.type !== 'Failure') {
    t.fail('server must reject symlinks without returning file contents');

    return;
  }

  t.is(resp.result.error.code, ErEnum.FILE_IS_SYMLINK);
});
