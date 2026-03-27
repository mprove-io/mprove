import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import { Prep } from '#backend/interfaces/prep';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';

let testId = 'backend-mcp__no-auth-header';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let response: any;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: true
          }
        ]
      }
    });

    response = await sendToMcp({
      httpServer: prep.httpServer,
      method: 'tools/list'
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(response.status, 400);
  t.is(response.body.jsonrpc, '2.0');
  t.is(response.body.error.code, -32600);
  t.is(response.body.error.message, ErEnum.BACKEND_UNAUTHORIZED);
});
