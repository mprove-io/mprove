import { BlockmlConfig } from '#blockml/config/blockml-config';

export function getTestConfig(devConfig: BlockmlConfig) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
