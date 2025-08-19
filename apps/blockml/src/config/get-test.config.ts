import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';

export function getTestConfig(devConfig: BlockmlConfig) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
