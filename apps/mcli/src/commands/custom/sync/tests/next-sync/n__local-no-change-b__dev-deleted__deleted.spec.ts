import test from 'ava';
import * as fse from 'fs-extra';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { nodeCommon } from '~mcli/barrels/node-common';
import { getConfig } from '~mcli/config/get.config';
import { cloneRepo } from '~mcli/functions/clone-repo';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { writeSyncConfig } from '~mcli/functions/write-sync-config';
import { CustomContext } from '~mcli/models/custom-command';
import { SyncCommand } from '../../sync';
let deepEqual = require('deep-equal');

let testId = 'mcli_n__local-no-change-b__dev-deleted__deleted';

test('1', async t => {
  let context: CustomContext;
  let code: number;
  let config = getConfig();

  let defaultBranch = common.BRANCH_MAIN;
  let env = common.PROJECT_ENV_PROD;

  let repoPath = `${config.mproveCliTestReposPath}/${testId}`;

  let localChangesToCommit: common.DiskFileChange[];

  await cloneRepo({
    repoPath: repoPath,
    gitUrl: config.mproveCliTestLocalSourceGitUrl
  });

  let projectId = common.makeId();

  let commandLine = `sync \
-p ${projectId} \
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

  let fileName = 'README.md';

  try {
    let syncTime = Date.now();

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

    let syncConfig = await writeSyncConfig({
      repoPath: repoPath,
      syncTime: syncTime
    });

    let deleteFileReqPayload: apiToBackend.ToBackendDeleteFileRequestPayload = {
      projectId: projectId,
      branchId: defaultBranch,
      envId: env,
      fileNodeId: `${projectId}/${fileName}`
    };

    await mreq<apiToBackend.ToBackendDeleteFileResponse>({
      loginToken: context.loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFile,
      payload: deleteFileReqPayload,
      host: context.config.mproveCliHost
    });

    code = await cli.run(commandLine.split(' '), context);

    localChangesToCommit = await nodeCommon.getChangesToCommit({
      repoDir: repoPath
    });
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: context,
      isJson: true
    });
  }

  let parsedOutput: any;

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

  let isPass =
    code === 0 &&
    parsedOutput.repo.changesToCommit.length === 1 &&
    parsedOutput.repo.changesToCommit[0].fileName === fileName &&
    parsedOutput.repo.changesToCommit[0].status ===
      common.FileStatusEnum.Deleted &&
    deepEqual(localChangesToCommit, parsedOutput.repo.changesToCommit);

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(parsedOutput.repo.changesToCommit.length === 1, true);
  t.is(parsedOutput.repo.changesToCommit[0].fileName === fileName, true);
  t.is(
    parsedOutput.repo.changesToCommit[0].status ===
      common.FileStatusEnum.Deleted,
    true
  );
  t.deepEqual(localChangesToCommit, parsedOutput.repo.changesToCommit);
});
