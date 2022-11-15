import { interfaces } from '~backend/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  // testConfig.backendLogIsJson = common.BoolEnum.FALSE;

  return testConfig;
}
