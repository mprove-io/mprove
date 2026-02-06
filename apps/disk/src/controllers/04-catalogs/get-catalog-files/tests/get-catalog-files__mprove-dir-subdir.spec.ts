import test from 'ava';
import { BRANCH_MAIN } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { ProjectLt, ProjectSt } from '#common/interfaces/st-lt';
import { ToDiskCreateOrgRequest } from '#common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskCreateProjectRequest } from '#common/interfaces/to-disk/02-projects/to-disk-create-project';
import {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '#common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-files';
import { ToDiskCreateFolderRequest } from '#common/interfaces/to-disk/06-folders/to-disk-create-folder';
import { ToDiskCreateFileRequest } from '#common/interfaces/to-disk/07-files/to-disk-create-file';
import { ToDiskSaveFileRequest } from '#common/interfaces/to-disk/07-files/to-disk-save-file';
import { logToConsoleDisk } from '#disk/functions/log-to-console-disk';
import { prepareTest } from '#disk/functions/prepare-test';

let testId = 'disk-get-catalog-files__mprove-dir-subdir';

let traceId = testId;
let orgId = testId;
let projectId = makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: ToDiskGetCatalogFilesResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, diskTabService, logger, cs } =
      await prepareTest(orgId);
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

    let createDataFolderRequest: ToDiskCreateFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/`,
        folderName: 'data'
      }
    };

    let createDataExtFolderRequest: ToDiskCreateFolderRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/`,
        folderName: 'data-ext'
      }
    };

    let createFileInDataRequest: ToDiskCreateFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/data/`,
        fileName: 'file1.yml',
        userAlias: 'u1'
      }
    };

    let createFileInDataExtRequest: ToDiskCreateFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        parentNodeId: `${projectId}/data-ext/`,
        fileName: 'file2.yml',
        userAlias: 'u1'
      }
    };

    let saveMproveYmlRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN,
        fileNodeId: `${projectId}/mprove.yml`,
        content: 'mprove_dir: ./data\n',
        userAlias: 'u1'
      }
    };

    let getCatalogFilesRequest: ToDiskGetCatalogFilesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: 'r1',
        branch: BRANCH_MAIN
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);
    await messageService.processMessage(createDataFolderRequest);
    await messageService.processMessage(createDataExtFolderRequest);
    await messageService.processMessage(createFileInDataRequest);
    await messageService.processMessage(createFileInDataExtRequest);
    await messageService.processMessage(saveMproveYmlRequest);

    resp = await messageService.processMessage(getCatalogFilesRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  let fileNodeIds = resp.payload.files.map(f => f.fileNodeId);

  t.true(fileNodeIds.includes(`${projectId}/mprove.yml`));
  t.true(fileNodeIds.includes(`${projectId}/data/file1.yml`));
  t.false(fileNodeIds.includes(`${projectId}/data-ext/file2.yml`));
});
