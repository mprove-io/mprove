import test from 'ava';
import fse from 'fs-extra';
import { BRANCH_MAIN } from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { makeId } from '#common/functions/make-id';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/to-disk-create-org';
import type { ToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/to-disk-create-project';
import type { ToDiskGetFileRequest } from '#common/zod/to-disk/07-files/to-disk-get-file';
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
  let resp: any;

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
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
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
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        devRepoId: 'r1',
        userAlias: 'u1'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    let orgPath = cs.get('diskOrganizationsPath');
    let orgDir = `${orgPath}/${orgId}`;
    let repoDir = `${orgDir}/${projectId}/r1`;
    let secretPath = `${orgDir}/SECRET_A.txt`;
    let symlinkPath = `${repoDir}/leak.view`;

    await fse.writeFile(secretPath, secretContent);
    await fse.symlink(secretPath, symlinkPath);

    let getFileRequest: ToDiskGetFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/leak.view`,
        builderLeft: BuilderLeftEnum.Tree
      }
    };

    resp = await messageService.processMessage(getFileRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.not(
    resp?.payload?.content,
    secretContent,
    'server must not return contents of a file outside the user repo via a symlink'
  );
  t.is(resp.info.status, ResponseInfoStatusEnum.Error);
  t.is(resp.info.error.message, ErEnum.FILE_IS_SYMLINK);
});
