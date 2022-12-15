import test from 'ava';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { PushCommand } from '../push';

let testId = 'mcli__push__ok';

test('1', async t => {
  let context: CustomContext;
  let code: number;

  let repo = enums.RepoEnum.Dev;
  let branch = common.BRANCH_MASTER;

  let projectId = common.makeId();
  let commandLine = `push -p ${projectId} --repo ${repo} --branch ${branch} --env prod`;

  let userId = common.makeId();
  let email = `${testId}@example.com`;
  let password = '123123';

  let orgId = 't' + testId;
  let orgName = testId;

  let projectName = testId;

  let config = getConfig();

  try {
    let { cli, mockContext } = await prepareTest({
      command: PushCommand,
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
            defaultBranch: branch,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            gitUrl: undefined,
            publicKey: undefined,
            privateKey: undefined
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
        ]
      },
      loginEmail: email,
      loginPassword: password
    });

    context = mockContext as any;

    let saveFileReqPayload: apiToBackend.ToBackendSaveFileRequestPayload = {
      projectId: projectId,
      branchId: branch,
      envId: 'prod',
      fileNodeId: `${projectId}/readme.md`,
      content: '123'
    };

    let saveFileResp = await mreq<apiToBackend.ToBackendSaveFileResponse>({
      loginToken: context.loginToken,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile,
      payload: saveFileReqPayload,
      host: config.mproveCliHost
    });

    let commitRepoReqPayload: apiToBackend.ToBackendCommitRepoRequestPayload = {
      projectId: projectId,
      isRepoProd: false,
      branchId: branch,
      commitMessage: 'm1'
    };

    let commitRepoResp = await mreq<apiToBackend.ToBackendCommitRepoResponse>({
      loginToken: context.loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
      payload: commitRepoReqPayload,
      host: config.mproveCliHost
    });

    code = await cli.run([...commandLine.split(' ')], context);
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: context,
      isJson: true
    });
  }

  let isPass = code === 0 && context.stdout.toString().includes('errorsTotal');

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(context.stdout.toString().includes('errorsTotal'), true);
});
