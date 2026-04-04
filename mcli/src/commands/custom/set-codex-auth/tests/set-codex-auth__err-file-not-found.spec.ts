import { expect, test } from 'bun:test';
import assert from 'node:assert/strict';
import retry from 'async-retry';
import { MCLI_E2E_RETRY_OPTIONS } from '#common/constants/top-mcli';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { makeTestApiKey } from '#mcli/functions/make-test-api-key';
import { prepareTest } from '#mcli/functions/prepare-test';
import { CustomContext } from '#mcli/models/custom-command';
import { SetCodexAuthCommand } from '../set-codex-auth';

let testId = 'mcli__set-codex-auth__err-file-not-found';

test('1', async () => {
  let code: number;
  let isPass: boolean;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let commandLine = `set-codex-auth \
--auth-file-path /tmp/non-existent-${makeId()}.json \
--json`;

    let userId = makeId();
    let email = `${testId}@example.com`;
    let password = '123123';
    let apiKey = makeTestApiKey({ testId: testId, userId: userId });

    let orgId = 't' + testId;
    let orgName = testId;

    let config = getConfig();

    try {
      let { cli, mockContext } = await prepareTest({
        command: SetCodexAuthCommand,
        config: config,
        deletePack: {
          emails: [email],
          orgIds: [orgId],
          projectIds: [],
          projectNames: []
        },
        seedPack: {
          users: [
            {
              userId: userId,
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
          ]
        },
        apiKey: apiKey
      });

      context = mockContext as any;
      code = await cli.run(commandLine.split(' '), context);
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    let stderrOutput = context.stderr.toString();

    assert.equal(code === 1, true, `code === 1`);
    assert.equal(
      stderrOutput.includes(ErEnum.MCLI_CODEX_AUTH_FILE_NOT_FOUND),
      true,
      `stderr includes MCLI_CODEX_AUTH_FILE_NOT_FOUND`
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
