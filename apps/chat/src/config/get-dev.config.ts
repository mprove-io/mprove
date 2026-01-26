import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { ChatConfig } from '~chat/config/chat-config';
import { ChatEnvEnum } from '~common/enums/env/chat-env.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';

export function getDevConfig(envFilePath: any) {
  let envFile: { [name: string]: string } = {};

  if (isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: ChatConfig = {
    chatEnv: <ChatEnvEnum>(process.env.CHAT_ENV || envFile.CHAT_ENV),

    chatZenKey: process.env.CHAT_ZEN_KEY || envFile.CHAT_ZEN_KEY,

    chatConcurrency: isDefined(process.env.CHAT_CONCURRENCY)
      ? Number(process.env.CHAT_CONCURRENCY)
      : isDefined(envFile.CHAT_CONCURRENCY)
        ? Number(envFile.CHAT_CONCURRENCY)
        : undefined,

    chatValkeyHost: process.env.CHAT_VALKEY_HOST || envFile.CHAT_VALKEY_HOST,

    chatValkeyPassword:
      process.env.CHAT_VALKEY_PASSWORD || envFile.CHAT_VALKEY_PASSWORD,

    chatOpencodeHost:
      process.env.CHAT_OPENCODE_HOST || envFile.CHAT_OPENCODE_HOST,

    chatOpencodePort: isDefined(process.env.CHAT_OPENCODE_PORT)
      ? Number(process.env.CHAT_OPENCODE_PORT)
      : isDefined(envFile.CHAT_OPENCODE_PORT)
        ? Number(envFile.CHAT_OPENCODE_PORT)
        : undefined,

    chatOpencodeTimeout: isDefined(process.env.CHAT_OPENCODE_TIMEOUT)
      ? Number(process.env.CHAT_OPENCODE_TIMEOUT)
      : isDefined(envFile.CHAT_OPENCODE_TIMEOUT)
        ? Number(envFile.CHAT_OPENCODE_TIMEOUT)
        : undefined,

    chatLogIsJson: enumToBoolean({
      value: process.env.CHAT_LOG_IS_JSON || envFile.CHAT_LOG_IS_JSON,
      name: 'CHAT_LOG_IS_JSON'
    }),
    chatLogResponseError: enumToBoolean({
      value:
        process.env.CHAT_LOG_RESPONSE_ERROR || envFile.CHAT_LOG_RESPONSE_ERROR,
      name: 'CHAT_LOG_RESPONSE_ERROR'
    }),
    chatLogResponseOk: enumToBoolean({
      value: process.env.CHAT_LOG_RESPONSE_OK || envFile.CHAT_LOG_RESPONSE_OK,
      name: 'CHAT_LOG_RESPONSE_OK'
    })
  };
  return devConfig;
}
