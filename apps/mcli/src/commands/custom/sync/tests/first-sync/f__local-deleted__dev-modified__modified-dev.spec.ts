import test from 'ava';
import * as fse from 'fs-extra';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';
import { getConfig } from '~mcli/config/get.config';
import { cloneRepo } from '~mcli/functions/clone-repo';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { SyncCommand } from '../../sync';
let assert = require('node:assert/strict');
let retry = require('async-retry');

let testId = 'mcli_f__local-deleted__dev-modified__modified-dev';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  let fileName = 'README.md';

  await retry(async (bail: any) => {
    let config = getConfig();

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
              defaultBranch: defaultBranch,
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

      let filePath = `${repoPath}/${fileName}`;

      await fse.remove(filePath);

      let saveFileReqPayload: apiToBackend.ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        branchId: defaultBranch,
        envId: env,
        fileNodeId: `${projectId}/${fileName}`,
        content: '1'
      };

      await mreq<apiToBackend.ToBackendSaveFileResponse>({
        loginToken: context.loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: context.config.mproveCliHost
      });

      code = await cli.run(commandLine.split(' '), context);
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
        common.FileStatusEnum.Modified,
      true,
      `parsedOutput.debug.localChangesToCommit[0].status === common.FileStatusEnum.Modified`
    );

    isPass = true;
  }, constants.RETRY_OPTIONS).catch((er: any) => {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());

    logToConsoleMcli({
      log: er,
      logLevel: common.LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  t.is(isPass, true);
});
