import { ChatConfig } from '~chat/config/chat-config';
import { ChatEnvEnum } from '~common/enums/env/chat-env.enum';
import { ErEnum } from '~common/enums/er.enum';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let devConfig = getDevConfig();

  let config =
    devConfig.chatEnv === ChatEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.chatEnv === ChatEnvEnum.TEST
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = transformValidSync({
    classType: ChatConfig,
    object: config,
    errorMessage: ErEnum.CHAT_WRONG_ENV_VALUES,
    logIsJson: config.chatLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
