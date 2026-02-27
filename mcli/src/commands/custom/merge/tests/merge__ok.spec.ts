import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import { BRANCH_MAIN } from '#common/constants/top';
import { RETRY_OPTIONS } from '#common/constants/top-mcli';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendCreateBranchRequestPayload,
  ToBackendCreateBranchResponse
} from '#common/interfaces/to-backend/branches/to-backend-create-branch';
import {
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/interfaces/to-backend/files/to-backend-save-file';
import {
  ToBackendCommitRepoRequestPayload,
  ToBackendCommitRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-commit-repo';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
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

      let createBranchReqPayload: ToBackendCreateBranchRequestPayload = {
        projectId: projectId,
        repoId: userId,
        newBranchId: theirBranch,
        fromBranchId: defaultBranch
      };

      let createBranchResp = await mreq<ToBackendCreateBranchResponse>({
        loginToken: context.loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        payload: createBranchReqPayload,
        host: config.mproveCliHost
      });

      let saveFileReqPayload: ToBackendSaveFileRequestPayload = {
        projectId: projectId,
        branchId: theirBranch,
        envId: 'prod',
        fileNodeId: `${projectId}/readme.md`,
        content: '123'
      };

      let saveFileResp = await mreq<ToBackendSaveFileResponse>({
        loginToken: context.loginToken,
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
        loginToken: context.loginToken,
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
