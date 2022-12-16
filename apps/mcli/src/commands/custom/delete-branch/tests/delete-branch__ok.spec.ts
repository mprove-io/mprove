import test from 'ava';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { DeleteBranchCommand } from '../delete-branch';

let testId = 'mcli__delete-branch__ok';

test('1', async t => {
  let context: CustomContext;
  let code: number;

  let defaultBranch = common.BRANCH_MASTER;

  let repo = 'dev';
  let branch = 'b1';

  let projectId = common.makeId();

  let commandLine = `delete-branch -p ${projectId} --repo ${repo} --branch ${branch}`;

  let userId = common.makeId();
  let email = `${testId}@example.com`;
  let password = '123123';

  let orgId = 't' + testId;
  let orgName = testId;

  let projectName = testId;

  let config = getConfig();

  try {
    let { cli, mockContext } = await prepareTest({
      command: DeleteBranchCommand,
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

    let isRepoProd = repo === 'production' ? true : false;

    let createBranchReqPayload: apiToBackend.ToBackendCreateBranchRequestPayload =
      {
        projectId: projectId,
        isRepoProd: isRepoProd,
        newBranchId: branch,
        fromBranchId: defaultBranch
      };

    let createBranchResp =
      await mreq<apiToBackend.ToBackendCreateBranchResponse>({
        loginToken: context.loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: createBranchReqPayload,
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

  let isPass =
    code === 0 && context.stdout.toString().includes('Deleted branch');

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(context.stdout.toString().includes('Deleted branch'), true);
});
