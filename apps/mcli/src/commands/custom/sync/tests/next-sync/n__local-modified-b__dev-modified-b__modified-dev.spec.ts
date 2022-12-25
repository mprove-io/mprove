import test from 'ava';
import * as fse from 'fs-extra';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';
import { getConfig } from '~mcli/config/get.config';
import { checkIsTrue } from '~mcli/functions/check-is-true';
import { cloneRepo } from '~mcli/functions/clone-repo';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { makeSyncTime } from '~mcli/functions/make-sync-time';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { writeSyncConfig } from '~mcli/functions/write-sync-config';
import { CustomContext } from '~mcli/models/custom-command';
import { SyncCommand } from '../../sync';
let retry = require('async-retry');

let testId = 'mcli_n__local-modified-b__dev-modified-b__modified-dev';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;
  let config = getConfig();

  let fileName = 'README.md';

  let localFileResultContent: string;

  await retry(async (bail: any) => {
    let defaultBranch = common.BRANCH_MAIN;
    let env = common.PROJECT_ENV_PROD;

    let repoPath = `${config.mproveCliTestReposPath}/${testId}`;

    await cloneRepo({
      repoPath: repoPath,
      gitUrl: config.mproveCliTestLocalSourceGitUrl
    });

    let projectId = common.makeId();

    let commandLine = `sync \
--project-id ${projectId} \
--env ${env} \
--local-path ${repoPath} \
--json \
--debug`;

    let userId = common.makeId();
    let email = `${testId}@example.com`;
    let password = '123123';

    let orgId = 't' + testId;
    let orgName = testId;

    let projectName = testId;

    let filePath = `${repoPath}/${fileName}`;

    await fse.writeFile(filePath, '1');

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
              isEmailVerified: common.BoolEnum.TRUE
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
              defaultBranch: common.BRANCH_MAIN,
              remoteType: common.ProjectRemoteTypeEnum.GitClone,
              gitUrl: config.mproveCliTestDevSourceGitUrl,
              publicKey: fse
                .readFileSync(config.mproveCliTestPublicKeyPath)
                .toString(),
              privateKey: fse
                .readFileSync(config.mproveCliTestPrivateKeyPath)
                .toString()
            }
          ],
          members: [
            {
              memberId: userId,
              email,
              projectId,
              isAdmin: common.BoolEnum.TRUE,
              isEditor: common.BoolEnum.TRUE,
              isExplorer: common.BoolEnum.TRUE
            }
          ],
          connections: [
            {
              projectId: projectId,
              connectionId: 'c1_postgres',
              envId: common.PROJECT_ENV_PROD,
              type: common.ConnectionTypeEnum.PostgreSQL,
              host: 'dwh-postgres',
              port: 5432,
              database: 'p_db',
              username: 'postgres',
              password: config.mproveCliTestDwhPostgresPassword
            }
          ]
        },
        loginEmail: email,
        loginPassword: password
      });

      context = mockContext as any;

      await common.sleep(constants.POSSIBLE_TIME_DIFF_MS);

      let saveFileReqPayload: apiToBackend.ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        branchId: defaultBranch,
        envId: env,
        fileNodeId: `${projectId}/${fileName}`,
        content: '2'
      };

      await mreq<apiToBackend.ToBackendSaveFileResponse>({
        loginToken: context.loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: context.config.mproveCliHost
      });

      let syncTime = await makeSyncTime();

      let syncConfig = await writeSyncConfig({
        repoPath: repoPath,
        syncTime: syncTime
      });

      code = await cli.run(commandLine.split(' '), context);

      localFileResultContent = fse.readFileSync(filePath).toString();
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    try {
      parsedOutput = JSON.parse(context.stdout.toString());
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    isPass =
      code === 0 &&
      parsedOutput.debug.localChangesToCommit.length === 1 &&
      parsedOutput.debug.localChangesToCommit[0].fileName === fileName &&
      parsedOutput.debug.localChangesToCommit[0].status ===
        common.FileStatusEnum.Modified &&
      localFileResultContent === '2';

    checkIsTrue(isPass);
  }, constants.RETRY_OPTIONS).catch((er: any) => {
    logToConsoleMcli({
      log: er,
      logLevel: common.LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(parsedOutput.debug.localChangesToCommit.length === 1, true);
  t.is(parsedOutput.debug.localChangesToCommit[0].fileName === fileName, true);
  t.is(
    parsedOutput.debug.localChangesToCommit[0].status ===
      common.FileStatusEnum.Modified,
    true
  );
  t.is(localFileResultContent === '2', true);
});
