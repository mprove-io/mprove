import test from 'ava';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { CommitCommand } from '../commit';
let assert = require('node:assert/strict');
let retry = require('async-retry');

let testId = 'mcli__commit__ok';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let branch = common.BRANCH_MAIN;

    let projectId = common.makeId();
    let commandLine = `commit \
--project-id ${projectId} \
--repo dev \
--branch ${branch} \
--commit-message m1 \
--get-repo \
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
        command: CommitCommand,
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
              isAdmin: true,
              isEditor: true,
              isExplorer: true
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
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: config.mproveCliHost
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
      common.isDefined(parsedOutput?.url),
      true,
      `common.isDefined(parsedOutput?.url)`
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
