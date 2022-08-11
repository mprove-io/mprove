import { interfaces } from '~backend/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  // testConfig.backendLogIsColor = common.BoolEnum.FALSE;

  return testConfig;
}
