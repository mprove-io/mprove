import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  testConfig.mproveLogIsColor = common.BoolEnum.FALSE;

  return testConfig;
}
