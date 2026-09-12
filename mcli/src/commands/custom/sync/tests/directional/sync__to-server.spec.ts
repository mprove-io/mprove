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
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/zod/to-backend/files/to-backend-save-file';
import type { ToBackendCloneTestRepoResponse } from '#common/zod/to-backend/test-routes/to-backend-clone-test-repo';
import { getConfig } from '#mcli/config/get.config';
import { getTestLoginToken } from '#mcli/functions/get-test-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { makeTestApiKey } from '#mcli/functions/make-test-api-key';
import { mreq } from '#mcli/functions/mreq';
import { prepareTest } from '#mcli/functions/prepare-test';
import type { CustomContext } from '#mcli/models/custom-command';
import { SyncCommand } from '../../sync';

let testId = 'mcli_sync__to-server';

test('1', async () => {
  let code: number;
  let isPass = false;
  let parsedOutput: any;
  let context: CustomContext;
  let secondParsedOutput: any;

  await retry(async () => {
    let config = getConfig();
    let repoPath = `${config.mproveCliTestReposPath}/${testId}`;
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
        content: 'server stale content'
      };

      await mreq<ToBackendSaveFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: config.mproveCliHost
      });

      await fse.writeFile(`${repoPath}/README.md`, 'local source content');
      await fse.writeFile(`${repoPath}/sync-local-added.txt`, 'local added');
      await fse.ensureDir(`${repoPath}/local-folder`);
      await fse.writeFile(`${repoPath}/local-folder/a.md`, 'local folder file');
      await fse.move(`${repoPath}/f`, `${repoPath}/f-local-renamed`);
      await fse.writeFile(
        `${repoPath}/f-local-renamed/added.md`,
        'local nested added'
      );
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

    let readmeChange = parsedOutput.debug.devChangesToCommit.find(
      (x: any) => x.fileName === 'README.md'
    );
    let localAddedChange = parsedOutput.debug.devChangesToCommit.find(
      (x: any) => x.fileName === 'sync-local-added.txt'
    );
    let localFolderFileChange = parsedOutput.debug.devChangesToCommit.find(
      (x: any) => x.fileName === 'a.md' && x.parentPath === 'local-folder'
    );
    let renamedFolderExistingFileChange =
      parsedOutput.debug.devChangesToCommit.find(
        (x: any) => x.fileName === 'r.md' && x.parentPath === 'f-local-renamed'
      );
    let renamedFolderAddedFileChange =
      parsedOutput.debug.devChangesToCommit.find(
        (x: any) =>
          x.fileName === 'added.md' && x.parentPath === 'f-local-renamed'
      );
    let ignoredFileChange = parsedOutput.debug.devChangesToCommit.find(
      (x: any) => x.fileName === 'a.md' && x.parentPath === '_nogit'
    );

    assert.equal(code, 0, 'sync exits successfully');
    assert.deepEqual(parsedOutput.appliedChangesOnLocal, []);
    assert.deepEqual(parsedOutput.appliedChangesOnServer, [
      '(deleted) f/r.md',
      '(modified) README.md',
      '(new) f-local-renamed/added.md',
      '(new) f-local-renamed/r.md',
      '(new) local-folder/a.md',
      '(new) sync-local-added.txt'
    ]);
    assert.equal(parsedOutput.debug.fromServer, false);
    assert.equal(
      readmeChange?.content,
      'local source content',
      'server diff contains local readme content'
    );
    assert.equal(
      localAddedChange?.content,
      'local added',
      'server diff contains local added file'
    );
    assert.equal(
      localFolderFileChange?.content,
      'local folder file',
      'server diff contains local new folder file'
    );
    assert.equal(
      renamedFolderExistingFileChange?.content,
      '# text',
      'server diff contains renamed folder existing file'
    );
    assert.equal(
      renamedFolderAddedFileChange?.content,
      'local nested added',
      'server diff contains renamed folder added file'
    );
    assert.equal(
      ignoredFileChange,
      undefined,
      'ignored _nogit file is skipped'
    );
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
