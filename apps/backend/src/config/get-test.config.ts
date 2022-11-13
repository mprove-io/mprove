import { interfaces } from '~backend/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  // testConfig.backendLogIsStringify = common.BoolEnum.FALSE;

  return testConfig;
}
