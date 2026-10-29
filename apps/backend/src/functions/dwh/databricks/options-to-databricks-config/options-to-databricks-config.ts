import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';

export type OptionsToDatabricksConfigOutput = {
  authType: ConnectionTab['options']['databricks']['authType'];
  host: string;
  path: string;
  token: string;
  oauthClientId: string;
  oauthClientSecret: string;
  defaultCatalog: string;
  defaultSchema: string;
};

export function optionsToDatabricksConfig(item: {
  connection: ConnectionTab;
}): OptionsToDatabricksConfigOutput {
  let { connection } = item;

  let config: OptionsToDatabricksConfigOutput = {
    authType: connection.options.databricks.authType,
    host:
      connection.options.databricks.internalHost ||
      connection.options.databricks.host,
    path: connection.options.databricks.path,
    token: connection.options.databricks.token,
    oauthClientId: connection.options.databricks.oauthClientId,
    oauthClientSecret: connection.options.databricks.oauthClientSecret,
    defaultCatalog: connection.options.databricks.defaultCatalog,
    defaultSchema: connection.options.databricks.defaultSchema
  };

  return config;
}
