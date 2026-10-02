import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { MCLI_E2E_RETRY_OPTIONS } from '#common/constants/top-mcli';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendCreateBranchOutput } from '#common/types/backend/routes/branches/create-branch/create-branch-output';
import type { ToBackendCreateBranchRequest } from '#common/types/backend/routes/branches/create-branch/create-branch-request';
import type { ToBackendSaveFileOutput } from '#common/types/backend/routes/files/save-file/save-file-output';
import type { ToBackendSaveFileRequest } from '#common/types/backend/routes/files/save-file/save-file-request';
import type { ToBackendCommitRepoOutput } from '#common/types/backend/routes/repos/commit-repo/commit-repo-output';
import type { ToBackendCommitRepoRequest } from '#common/types/backend/routes/repos/commit-repo/commit-repo-request';
import type { CustomContext } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { getTestLoginToken } from '#mcli/functions/get-test-login-token/get-test-login-token';
import { makeTestApiKey } from '#mcli/functions/make-test-api-key/make-test-api-key';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import { prepareTest } from '#mcli/functions/top/prepare-test/prepare-test';
import { MergeCommand } from './merge.command';

let testId = 'mcli__merge__ok';

test('1', async () => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let theirBranch = 'b1';
    let defaultBranch = BRANCH_MAIN;

    let projectId = makeId();
    let commandLine = `merge \
--project-id ${projectId} \
--their-branch ${theirBranch} \
--branch ${defaultBranch} \
--env prod \
--get-errors \
--get-repo \
--json`;

    let userId = makeId();
    let email = `${testId}@example.com`;
    let password = '123123';
    let apiKey = makeTestApiKey({ testId, userId });

    let orgId = 't' + testId;
    let orgName = testId;

    let projectName = testId;

    let config = getConfig();

    try {
      let { cli, mockContext } = await prepareTest({
        command: MergeCommand,
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
              isEmailVerified: true,
              apiKey: apiKey
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
        apiKey: apiKey
      });

      context = mockContext as any;

      let loginToken = await getTestLoginToken({
        email: email,
        password: password,
        host: config.mproveCliHost
      });

      let createBranchReqPayload: ToBackendCreateBranchRequest['input'] = {
        projectId: projectId,
        repoId: userId,
        newBranchId: theirBranch,
        fromBranchId: defaultBranch
      };

      let createBranchOutput: ToBackendCreateBranchOutput = await mreq({
        apiKey: context.config.mproveCliApiKey,
        route: 'api/ToBackendCreateBranch',
        payload: createBranchReqPayload,
        host: config.mproveCliHost
      });

      let saveFileReqPayload: ToBackendSaveFileRequest['input'] = {
        projectId: projectId,
        repoId: userId,
        branchId: theirBranch,
        envId: PROJECT_ENV_PROD,
        fileNodeId: `${projectId}/readme.md`,
        content: '123'
      };

      let saveFileOutput: ToBackendSaveFileOutput = await mreq({
        apiKey: loginToken,
        route: 'api/ToBackendSaveFile',
        payload: saveFileReqPayload,
        host: config.mproveCliHost
      });

      let commitRepoReqPayload: ToBackendCommitRepoRequest['input'] = {
        projectId: projectId,
        repoId: userId,
        branchId: theirBranch,
        commitMessage: 'm1'
      };

      let commitRepoOutput: ToBackendCommitRepoOutput = await mreq({
        apiKey: context.config.mproveCliApiKey,
        route: 'api/ToBackendCommitRepo',
        payload: commitRepoReqPayload,
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
      isDefined(parsedOutput?.validationErrorsTotal),
      true,
      `isDefined(parsedOutput?.validationErrorsTotal)`
    );

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
