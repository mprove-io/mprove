import { ChatConfig } from '#chat/config/chat-config';

export function getProdConfig(devConfig: ChatConfig) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
