import { api } from '~backend/barrels/api';
import { interfaces } from '~backend/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  testConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return testConfig;
}
