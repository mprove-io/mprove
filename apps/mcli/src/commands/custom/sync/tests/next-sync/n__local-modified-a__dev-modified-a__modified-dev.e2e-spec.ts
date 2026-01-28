import test from 'ava';
import * as fse from 'fs-extra';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import {
  POSSIBLE_TIME_DIFF_MS,
  RETRY_OPTIONS
} from '#common/constants/top-mcli';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FileStatusEnum } from '#common/enums/file-status.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { sleep } from '#common/functions/sleep';
import {
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/interfaces/to-backend/files/to-backend-save-file';
import { getConfig } from '~mcli/config/get.config';
import { cloneRepo } from '~mcli/functions/clone-repo';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { makeSyncTime } from '~mcli/functions/make-sync-time';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { writeSyncConfig } from '~mcli/functions/write-sync-config';
import { CustomContext } from '~mcli/models/custom-command';
import { SyncCommand } from '../../sync';

let assert = require('node:assert/strict');
let retry = require('async-retry');

let testId = 'mcli_n__local-modified-a__dev-modified-a__modified-dev';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;
  let config = getConfig();

  let fileName = 'README.md';

  let localFileResultContent: string;

  await retry(async (bail: any) => {
    let defaultBranch = BRANCH_MAIN;
    let env = PROJECT_ENV_PROD;

    let repoPath = `${config.mproveCliTestReposPath}/${testId}`;

    await cloneRepo({
      repoPath: repoPath,
      gitUrl: config.mproveCliTestLocalSourceGitUrl
    });

    let projectId = makeId();

    let commandLine = `sync \
--project-id ${projectId} \
--env ${env} \
--local-path ${repoPath} \
--json \
--debug`;

    let userId = makeId();
    let email = `${testId}@example.com`;
    let password = '123123';

    let orgId = 't' + testId;
    let orgName = testId;

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
              userId,
              email: email,
              password: password,
              isEmailVerified: true
            }
          ],
          orgs: [
            {
              orgId: orgId,
              ownerEmail: email,
              name: orgName
            }
          ],
          projects: [
            {
              orgId,
              projectId,
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
              email,
              projectId,
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
        loginEmail: email,
        loginPassword: password
      });

      context = mockContext as any;

      let syncTime = await makeSyncTime();

      let filePath = `${repoPath}/${fileName}`;

      await fse.writeFile(filePath, '1');

      await sleep(POSSIBLE_TIME_DIFF_MS);

      let saveFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        branchId: defaultBranch,
        envId: env,
        fileNodeId: `${projectId}/${fileName}`,
        content: '2'
      };

      await mreq<ToBackendSaveFileResponse>({
        loginToken: context.loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: context.config.mproveCliHost
      });

      let syncConfig = await writeSyncConfig({
        repoPath: repoPath,
        syncTime: syncTime
      });

      code = await cli.run(commandLine.split(' '), context);

      localFileResultContent = fse.readFileSync(filePath).toString();
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

    assert.equal(code === 0, true, `code === 0`);
    assert.equal(
      parsedOutput.debug.localChangesToCommit.length === 1,
      true,
      `parsedOutput.debug.localChangesToCommit.length === 1`
    );
    assert.equal(
      parsedOutput.debug.localChangesToCommit[0].fileName === fileName,
      true,
      `parsedOutput.debug.localChangesToCommit[0].fileName === fileName`
    );
    assert.equal(
      parsedOutput.debug.localChangesToCommit[0].status ===
        FileStatusEnum.Modified,
      true,
      `parsedOutput.debug.localChangesToCommit[0].status === FileStatusEnum.Modified`
    );
    assert.equal(
      localFileResultContent === '2',
      true,
      `localFileResultContent === '2'`
    );

    isPass = true;
  }, RETRY_OPTIONS).catch((er: any) => {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());

    logToConsoleMcli({
      log: er,
      logLevel: LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  t.is(isPass, true);
});
