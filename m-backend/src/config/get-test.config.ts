import { interfaces } from '~/barrels/interfaces';
import { api } from '~/barrels/api';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  testConfig.backendDropDatabaseOnStart = api.BoolEnum.FALSE;
  testConfig.backendSyncDatabaseOnStart = api.BoolEnum.FALSE;
  testConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return testConfig;
}
