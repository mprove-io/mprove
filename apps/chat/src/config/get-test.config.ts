import { ChatConfig } from '~chat/config/chat-config';

export function getTestConfig(devConfig: ChatConfig) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
