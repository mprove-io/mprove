import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { MCLI_E2E_RETRY_OPTIONS } from '#common/constants/top-mcli';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendCreateBranchRequestPayload,
  ToBackendCreateBranchResponse
} from '#common/zod/to-backend/branches/to-backend-create-branch';
import type {
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/zod/to-backend/files/to-backend-save-file';
import type {
  ToBackendCommitRepoRequestPayload,
  ToBackendCommitRepoResponse
} from '#common/zod/to-backend/repos/to-backend-commit-repo';
import { getConfig } from '#mcli/config/get.config';
import { getTestLoginToken } from '#mcli/functions/get-test-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { makeTestApiKey } from '#mcli/functions/make-test-api-key';
import { mreq } from '#mcli/functions/mreq';
import { prepareTest } from '#mcli/functions/prepare-test';
import { CustomContext } from '#mcli/models/custom-command';
import { MergeCommand } from '../merge';

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

      let createBranchReqPayload: ToBackendCreateBranchRequestPayload = {
        projectId: projectId,
        repoId: userId,
        newBranchId: theirBranch,
        fromBranchId: defaultBranch
      };

      let createBranchResp = await mreq<ToBackendCreateBranchResponse>({
        apiKey: context.config.mproveCliApiKey,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: createBranchReqPayload,
        host: config.mproveCliHost
      });

      let saveFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: theirBranch,
        envId: PROJECT_ENV_PROD,
        fileNodeId: `${projectId}/readme.md`,
        content: '123'
      };

      let saveFileResp = await mreq<ToBackendSaveFileResponse>({
        apiKey: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: saveFileReqPayload,
        host: config.mproveCliHost
      });

      let commitRepoReqPayload: ToBackendCommitRepoRequestPayload = {
        projectId: projectId,
        repoId: userId,
        branchId: theirBranch,
        commitMessage: 'm1'
      };

      let commitRepoResp = await mreq<ToBackendCommitRepoResponse>({
        apiKey: context.config.mproveCliApiKey,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
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
