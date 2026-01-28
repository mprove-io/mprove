import { ChatConfig } from '#chat/config/chat-config';
import { ChatEnvEnum } from '#common/enums/env/chat-env.enum';
import { enumToBoolean } from '#common/functions/enum-to-boolean';
import { isDefined } from '#common/functions/is-defined';

export function getDevConfig() {
  let devConfig: ChatConfig = {
    chatEnv: <ChatEnvEnum>process.env.CHAT_ENV,

    chatZenKey: process.env.CHAT_ZEN_KEY,

    chatConcurrency: isDefined(process.env.CHAT_CONCURRENCY)
      ? Number(process.env.CHAT_CONCURRENCY)
      : undefined,

    chatValkeyHost: process.env.CHAT_VALKEY_HOST,

    chatValkeyPassword: process.env.CHAT_VALKEY_PASSWORD,

    chatOpencodeHost: process.env.CHAT_OPENCODE_HOST,

    chatOpencodePort: isDefined(process.env.CHAT_OPENCODE_PORT)
      ? Number(process.env.CHAT_OPENCODE_PORT)
      : undefined,

    chatOpencodeTimeout: isDefined(process.env.CHAT_OPENCODE_TIMEOUT)
      ? Number(process.env.CHAT_OPENCODE_TIMEOUT)
      : undefined,

    chatLogIsJson: enumToBoolean({
      value: process.env.CHAT_LOG_IS_JSON,
      name: 'CHAT_LOG_IS_JSON'
    }),
    chatLogResponseError: enumToBoolean({
      value: process.env.CHAT_LOG_RESPONSE_ERROR,
      name: 'CHAT_LOG_RESPONSE_ERROR'
    }),
    chatLogResponseOk: enumToBoolean({
      value: process.env.CHAT_LOG_RESPONSE_OK,
      name: 'CHAT_LOG_RESPONSE_OK'
    })
  };
  return devConfig;
}
