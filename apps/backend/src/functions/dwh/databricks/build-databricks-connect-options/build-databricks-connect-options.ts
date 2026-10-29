import type { ConnectionOptions } from '@databricks/sql/dist/contracts/IDBSQLClient';
import type { OptionsToDatabricksConfigOutput } from '#backend/functions/dwh/databricks/options-to-databricks-config/options-to-databricks-config';

export function buildDatabricksConnectOptions(item: {
  config: OptionsToDatabricksConfigOutput;
}): ConnectionOptions {
  let { config } = item;

  if (config.authType === 'OAuthM2M') {
    let connectionOptions: ConnectionOptions = {
      host: config.host,
      path: config.path,
      authType: 'databricks-oauth',
      oauthClientId: config.oauthClientId,
      oauthClientSecret: config.oauthClientSecret
    };

    return connectionOptions;
  } else {
    let connectionOptions: ConnectionOptions = {
      host: config.host,
      path: config.path,
      token: config.token
    };

    return connectionOptions;
  }
}
