import test from 'ava';
import { BRANCH_MAIN } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { ProjectLt, ProjectSt } from '#common/interfaces/st-lt';
import { ToDiskCreateOrgRequest } from '#common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '#common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ToDiskCreateFolderRequest } from '#common/interfaces/to-disk/06-folders/to-disk-create-folder';
import { logToConsoleDisk } from '#disk/functions/log-to-console-disk';
import { prepareTest } from '#disk/functions/prepare-test';

let testId = 'disk-create-folder__path-traversal';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

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

    let createFolderRequest: ToDiskCreateFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/../../`,
        folderName: 'part'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(createFolderRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp.info.status, ResponseInfoStatusEnum.Error);
  t.is(resp.info.error.message, ErEnum.DISK_PATH_TRAVERSAL);
});
