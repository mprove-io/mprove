import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makeDatabricksMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.databricks;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  if (isDefined(opts.host)) {
    envs[`${envPrefix}_HOST`] = String(opts.host);
  }

  if (isDefined(opts.path)) {
    envs[`${envPrefix}_PATH`] = String(opts.path);
  }

  if (isDefined(opts.token)) {
    envs[`${envPrefix}_TOKEN`] = String(opts.token);
  }

  if (isDefined(opts.oauthClientId)) {
    envs[`${envPrefix}_OAUTH_CLIENT_ID`] = String(opts.oauthClientId);
  }

  if (isDefined(opts.oauthClientSecret)) {
    envs[`${envPrefix}_OAUTH_CLIENT_SECRET`] = String(opts.oauthClientSecret);
  }

  if (isDefined(opts.defaultCatalog)) {
    envs[`${envPrefix}_DEFAULT_CATALOG`] = String(opts.defaultCatalog);
  }

  if (isDefined(opts.defaultSchema)) {
    envs[`${envPrefix}_DEFAULT_SCHEMA`] = String(opts.defaultSchema);
  }

  if (isDefined(opts.authType)) {
    envs[`${envPrefix}_AUTH_TYPE`] = String(opts.authType);
  }

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'databricks',
    host: { env: `${envPrefix}_HOST` },
    path: { env: `${envPrefix}_PATH` },
    token: { env: `${envPrefix}_TOKEN` },
    oauthClientId: { env: `${envPrefix}_OAUTH_CLIENT_ID` },
    oauthClientSecret: { env: `${envPrefix}_OAUTH_CLIENT_SECRET` },
    defaultCatalog: { env: `${envPrefix}_DEFAULT_CATALOG` },
    defaultSchema: { env: `${envPrefix}_DEFAULT_SCHEMA` }
  };

  let malloyConfigPart: MalloyConfigPart = {
    malloyConnectionConfigEntry: malloyConnectionConfigEntry,
    envs: envs,
    files: files
  };

  return malloyConfigPart;
}
