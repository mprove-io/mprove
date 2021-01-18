import { interfaces } from '../barrels/interfaces';
import { api } from '../barrels/api';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  testConfig.backendDropDatabaseOnStart =
    testConfig.backendDropDatabaseOnStart || api.BoolEnum.FALSE;

  testConfig.backendSyncDatabaseOnStart =
    testConfig.backendSyncDatabaseOnStart || api.BoolEnum.FALSE;

  testConfig.backendRegisterOnlyInvitedUsers =
    testConfig.backendRegisterOnlyInvitedUsers || api.BoolEnum.FALSE;

  testConfig.mproveLogType = testConfig.mproveLogType || api.LogTypeEnum.DEV;

  return testConfig;
}
