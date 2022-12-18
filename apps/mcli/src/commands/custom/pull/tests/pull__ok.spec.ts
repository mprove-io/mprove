import test from 'ava';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { PullCommand } from '../pull';

let testId = 'mcli__pull__ok';

test('1', async t => {
  let context: CustomContext;
  let code: number;

  let defaultBranch = common.BRANCH_MASTER;

  let projectId = common.makeId();
  let commandLine = `pull \
-p ${projectId} \
--repo dev \
--branch ${defaultBranch} \
--env prod \
--json`;

  let userId = common.makeId();
  let email = `${testId}@example.com`;
  let password = '123123';

  let orgId = 't' + testId;
  let orgName = testId;

  let projectName = testId;

  let config = getConfig();

  try {
    let { cli, mockContext } = await prepareTest({
      command: PullCommand,
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
    code = await cli.run(commandLine.split(' '), context);
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

  let isPass = code === 0 && common.isDefined(parsedOutput?.errorsTotal);

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(common.isDefined(parsedOutput?.errorsTotal), true);
});
