import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import { BRANCH_MAIN, PROD_REPO_ID } from '#common/constants/top';
import { RETRY_OPTIONS } from '#common/constants/top-mcli';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendCreateBranchRequestPayload,
  ToBackendCreateBranchResponse
} from '#common/interfaces/to-backend/branches/to-backend-create-branch';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { prepareTest } from '#mcli/functions/prepare-test';
import { CustomContext } from '#mcli/models/custom-command';
import { DeleteBranchCommand } from '../delete-branch';

let testId = 'mcli__delete-branch__ok';

test('1', async () => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let defaultBranch = BRANCH_MAIN;

    let repo = 'dev';
    let branch = 'b1';

    let projectId = makeId();

    let commandLine = `delete-branch \
--project-id ${projectId} \
--repo ${repo} \
--branch ${branch} \
--json`;

    let userId = makeId();
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
              defaultBranch: defaultBranch,
              remoteType: ProjectRemoteTypeEnum.Managed,
              gitUrl: undefined,
              publicKey: undefined,
              privateKey: undefined,
              publicKeyEncrypted: undefined,
              privateKeyEncrypted: undefined,
              passPhrase: undefined
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

      let repoId = repo === 'production' ? PROD_REPO_ID : userId;

      let createBranchReqPayload: ToBackendCreateBranchRequestPayload = {
        projectId: projectId,
        repoId: repoId,
        newBranchId: branch,
        fromBranchId: defaultBranch
      };

      let createBranchResp = await mreq<ToBackendCreateBranchResponse>({
        loginToken: context.loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: createBranchReqPayload,
        host: config.mproveCliHost
      });

      code = await cli.run(commandLine.split(' '), context);
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
      parsedOutput?.message?.includes('Deleted branch'),
      true,
      `parsedOutput?.message?.includes('Deleted branch')`
    );

    isPass = true;
  }, RETRY_OPTIONS).catch((er: any) => {
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
