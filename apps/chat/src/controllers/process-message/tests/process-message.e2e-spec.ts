import test from 'ava';
import { logToConsoleChat } from '#chat/functions/log-to-console-chat';
import { prepareTest } from '#chat/functions/prepare-test';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToChatRequestInfoNameEnum } from '#common/enums/to/to-chat-request-info-name.enum';
import {
  ToChatProcessMessageRequest,
  ToChatProcessMessageResponse
} from '#common/interfaces/to-chat/to-chat-process-message';

let testId = 'chat-process-message';
let traceId = testId;

test('1', async t => {
  let resp: ToChatProcessMessageResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, logger, cs } = await prepareTest();
    wLogger = logger;
    configService = cs;

    let processMessageRequest: ToChatProcessMessageRequest = {
      info: {
        name: ToChatRequestInfoNameEnum.ToChatProcessMessage,
        traceId: traceId
      },
      payload: {
        message: 'Hello, what is the current time?',
        startState: undefined
      }
    };

    // test is manual only (uncomment this and "t." to run external api if needed)
    // resp = await messageService.processMessage(processMessageRequest);
    // console.log('resp.payload.answer');
    // console.log(resp.payload.answer);
    // console.log('resp.payload.endState');
    // console.log(resp.payload.endState);
  } catch (e) {
    logToConsoleChat({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(1, 1);
  // t.truthy(resp?.payload?.answer);
  // t.is(resp?.payload?.endState?.messages?.length, 2);
  // t.is(resp?.payload?.endState?.messages[0]?.role, 'user');
  // t.is(resp?.payload?.endState?.messages[1]?.role, 'assistant');
});
