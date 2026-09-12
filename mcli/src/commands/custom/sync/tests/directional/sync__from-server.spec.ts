import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import fse from 'fs-extra';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { MCLI_E2E_RETRY_OPTIONS } from '#common/constants/top-mcli';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendRenameCatalogNodeRequestPayload,
  ToBackendRenameCatalogNodeResponse
} from '#common/zod/to-backend/catalogs/to-backend-rename-catalog-node';
import type {
  ToBackendCreateFileRequestPayload,
  ToBackendCreateFileResponse
} from '#common/zod/to-backend/files/to-backend-create-file';
import type {
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/zod/to-backend/files/to-backend-save-file';
import type {
  ToBackendCreateFolderRequestPayload,
  ToBackendCreateFolderResponse
} from '#common/zod/to-backend/folders/to-backend-create-folder';
import type { ToBackendCloneTestRepoResponse } from '#common/zod/to-backend/test-routes/to-backend-clone-test-repo';
import { getConfig } from '#mcli/config/get.config';
import { getTestLoginToken } from '#mcli/functions/get-test-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { makeTestApiKey } from '#mcli/functions/make-test-api-key';
import { mreq } from '#mcli/functions/mreq';
import { prepareTest } from '#mcli/functions/prepare-test';
import type { CustomContext } from '#mcli/models/custom-command';
import { SyncCommand } from '../../sync';

let testId = 'mcli_sync__from-server';

test('1', async () => {
  let code: number;
  let isPass = false;
  let parsedOutput: any;
  let context: CustomContext;
  let repoPath: string;
  let secondParsedOutput: any;

  await retry(async () => {
    let config = getConfig();
    repoPath = `${config.mproveCliTestReposPath}/${testId}`;
    let orgId = `t${testId}`;

    await mreq<ToBackendCloneTestRepoResponse>({
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCloneTestRepo,
      payload: {
        testId: testId
      },
      host: config.mproveCliHost
    });

    let projectId = makeId();

    let commandLine = `sync \
--project-id ${projectId} \
--env ${PROJECT_ENV_PROD} \
--local-path ${repoPath} \
--from-server \
--json \
--debug`;

    let userId = makeId();
    let email = `${testId}@example.com`;
    let password = '123123';
    let apiKey = makeTestApiKey({ testId: testId, userId: userId });

    let projectName = testId;

    try {
      let { cli, mockContext } = await prepareTest({
        command: SyncCommand,
        config: config,
        deletePack: {
          emails: [email],
          orgIds: [orgId],
          projectIds: [projectId],
          projectNames: [projectName]
        },
        seedPack: {
          users: [
            {
              userId: userId,
              email: email,
              password: password,
              isEmailVerified: true,
              apiKey: apiKey
            }
          ],
          orgs: [
            {
              orgId: orgId,
              ownerEmail: email,
              name: testId
            }
          ],
          projects: [
            {
              orgId: orgId,
              projectId: projectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: ProjectRemoteTypeEnum.GitClone,
              gitUrl: config.mproveCliTestDevSourceGitUrl,
              publicKey: fse
                .readFileSync(config.mproveCliTestPublicKeyPath)
                .toString(),
              privateKeyEncrypted: fse
                .readFileSync(config.mproveCliTestPrivateKeyEncryptedPath)
                .toString(),
              passPhrase: config.mproveCliTestPassPhrase
            }
          ],
          members: [
            {
              memberId: userId,
              email: email,
              projectId: projectId,
              isAdmin: true,
              isEditor: true,
              isExplorer: true
            }
          ],
          connections: [
            {
              projectId: projectId,
              connectionId: 'c1_postgres',
              envId: PROJECT_ENV_PROD,
              type: ConnectionTypeEnum.PostgreSQL,
              options: {
                postgres: {
                  host: 'dwh-postgres',
                  port: 5436,
                  database: 'p_db',
                  username: config.mproveCliTestDwhPostgresUser,
                  password: config.mproveCliTestDwhPostgresPassword,
                  isSSL: false
                }
              }
            }
          ]
        },
        apiKey: apiKey
      });

      context = mockContext as any;

      let loginToken = await getTestLoginToken({
        email: email,
        password: password,
        host: config.mproveCliHost
      });

      let saveFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        fileNodeId: `${projectId}/readme.md`,
        content: 'server source content'
      };

      await mreq<ToBackendSaveFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: config.mproveCliHost
      });

      let createFolderReqPayload: ToBackendCreateFolderRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        parentNodeId: projectId,
        folderName: 'server-folder'
      };

      await mreq<ToBackendCreateFolderResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateFolder,
        payload: createFolderReqPayload,
        host: config.mproveCliHost
      });

      let createFolderFileReqPayload: ToBackendCreateFileRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        parentNodeId: `${projectId}/server-folder`,
        fileName: 'a.md',
        modelInfo: undefined
      };

      await mreq<ToBackendCreateFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload: createFolderFileReqPayload,
        host: config.mproveCliHost
      });

      let saveFolderFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        fileNodeId: `${projectId}/server-folder/a.md`,
        content: 'ab'
      };

      await mreq<ToBackendSaveFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFolderFileReqPayload,
        host: config.mproveCliHost
      });

      let createExistingFolderFileReqPayload: ToBackendCreateFileRequestPayload =
        {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          parentNodeId: `${projectId}/f`,
          fileName: 'server-added.md',
          modelInfo: undefined
        };

      await mreq<ToBackendCreateFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload: createExistingFolderFileReqPayload,
        host: config.mproveCliHost
      });

      let saveExistingFolderFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        fileNodeId: `${projectId}/f/server-added.md`,
        content: 'server nested added'
      };

      await mreq<ToBackendSaveFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveExistingFolderFileReqPayload,
        host: config.mproveCliHost
      });

      let renameFolderReqPayload: ToBackendRenameCatalogNodeRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        nodeId: `${projectId}/f`,
        newName: 'f-server-renamed'
      };

      await mreq<ToBackendRenameCatalogNodeResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode,
        payload: renameFolderReqPayload,
        host: config.mproveCliHost
      });

      await fse.writeFile(`${repoPath}/README.md`, 'local stale content');
      await fse.writeFile(`${repoPath}/local-untracked.txt`, 'remove me');
      await fse.ensureDir(`${repoPath}/_nogit`);
      await fse.writeFile(`${repoPath}/_nogit/a.md`, 'ab');

      code = await cli.run(commandLine.split(' '), context);

      let secondContextPack = await prepareTest({
        command: SyncCommand,
        config: config,
        apiKey: apiKey
      });
      let secondContext = secondContextPack.mockContext as any;
      let secondCode = await secondContextPack.cli.run(
        commandLine.split(' '),
        secondContext
      );

      assert.equal(secondCode, 0, 'second sync exits successfully');
      secondParsedOutput = JSON.parse(secondContext.stdout.toString());
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    try {
      parsedOutput = JSON.parse(context.stdout.toString());
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    assert.equal(code, 0, 'sync exits successfully');
    assert.deepEqual(parsedOutput.appliedChangesOnLocal, [
      '(deleted) f/r.md',
      '(deleted) local-untracked.txt',
      '(modified) README.md',
      '(new) f-server-renamed/r.md',
      '(new) f-server-renamed/server-added.md',
      '(new) server-folder/a.md'
    ]);
    assert.deepEqual(parsedOutput.appliedChangesOnServer, []);
    assert.equal(parsedOutput.debug.fromServer, true);
    assert.equal(
      await fse.readFile(`${repoPath}/README.md`, 'utf8'),
      'server source content'
    );
    assert.equal(
      await fse.pathExists(`${repoPath}/local-untracked.txt`),
      false
    );
    assert.equal(await fse.readFile(`${repoPath}/_nogit/a.md`, 'utf8'), 'ab');
    assert.equal(await fse.pathExists(`${repoPath}/f/r.md`), false);
    assert.equal(
      await fse.readFile(`${repoPath}/f-server-renamed/r.md`, 'utf8'),
      '# text'
    );
    assert.equal(
      await fse.readFile(
        `${repoPath}/f-server-renamed/server-added.md`,
        'utf8'
      ),
      'server nested added'
    );
    assert.equal(
      await fse.readFile(`${repoPath}/server-folder/a.md`, 'utf8'),
      'ab'
    );
    assert.equal(parsedOutput.debug.changedFiles.length, 0);
    assert.equal(parsedOutput.debug.deletedFiles.length, 0);
    assert.deepEqual(secondParsedOutput.appliedChangesOnLocal, []);
    assert.deepEqual(secondParsedOutput.appliedChangesOnServer, []);

    isPass = true;
  }, MCLI_E2E_RETRY_OPTIONS).catch((er: any) => {
    if (context) {
      console.log(context.stdout.toString());
      console.log(context.stderr.toString());
    }

    logToConsoleMcli({
      log: er,
      logLevel: LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  expect(isPass).toBe(true);
});
