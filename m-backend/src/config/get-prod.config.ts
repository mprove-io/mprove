import { interfaces } from '../barrels/interfaces';
import { api } from '../barrels/api';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  prodConfig.backendDropDatabaseOnStart = api.BoolEnum.FALSE;
  prodConfig.backendSyncDatabaseOnStart = api.BoolEnum.FALSE;
  prodConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return prodConfig;
}
