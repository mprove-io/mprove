import { interfaces } from '../barrels/interfaces';
import { api } from '../barrels/api';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  prodConfig.backendDropDatabaseOnStart =
    prodConfig.backendDropDatabaseOnStart || api.BoolEnum.FALSE;

  prodConfig.backendSyncDatabaseOnStart =
    prodConfig.backendSyncDatabaseOnStart || api.BoolEnum.FALSE;

  prodConfig.backendRegisterOnlyInvitedUsers =
    prodConfig.backendRegisterOnlyInvitedUsers || api.BoolEnum.FALSE;

  prodConfig.mproveLogType = prodConfig.mproveLogType || api.LogTypeEnum.PROD;

  return prodConfig;
}
