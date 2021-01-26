import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  testConfig.backendDropDatabaseOnStart = api.BoolEnum.FALSE;
  testConfig.backendSyncDatabaseOnStart = api.BoolEnum.FALSE;
  testConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return testConfig;
}
