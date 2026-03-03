import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { RETRY_OPTIONS } from '#common/constants/top-mcli';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/interfaces/to-backend/files/to-backend-save-file';
import {
  ToBackendCommitRepoRequestPayload,
  ToBackendCommitRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-commit-repo';
import { getConfig } from '#mcli/config/get.config';
import { getTestLoginToken } from '#mcli/functions/get-test-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { makeTestApiKey } from '#mcli/functions/make-test-api-key';
import { mreq } from '#mcli/functions/mreq';
import { prepareTest } from '#mcli/functions/prepare-test';
import { CustomContext } from '#mcli/models/custom-command';
import { PushCommand } from '../push';

let testId = 'mcli__push__ok';

test('1', async () => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let repo = RepoTypeEnum.Dev;
    let branch = BRANCH_MAIN;

    let projectId = makeId();
    let commandLine = `push \
--project-id ${projectId} \
--repo ${repo} \
--branch ${branch} \
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
              defaultBranch: branch,
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

      let saveFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        branchId: branch,
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
        branchId: branch,
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
