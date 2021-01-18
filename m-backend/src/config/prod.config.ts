import { api } from '../barrels/api';
import baseConfig from './base.config';

export default () => {
  let config = baseConfig();

  config.backendDropDatabaseOnStart =
    config.backendDropDatabaseOnStart || api.BoolEnum.FALSE;

  config.backendRegisterOnlyInvitedUsers =
    config.backendRegisterOnlyInvitedUsers || api.BoolEnum.FALSE;

  config.mproveLogType = config.mproveLogType || api.LogTypeEnum.PROD;

  return config;
};
