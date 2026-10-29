import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makePrestoMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.presto;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  if (isDefined(opts.server)) {
    envs[`${envPrefix}_SERVER`] = String(opts.server);
  }

  if (isDefined(opts.port)) {
    envs[`${envPrefix}_PORT`] = String(opts.port);
  }

  if (isDefined(opts.catalog)) {
    envs[`${envPrefix}_CATALOG`] = String(opts.catalog);
  }

  if (isDefined(opts.schema)) {
    envs[`${envPrefix}_SCHEMA`] = String(opts.schema);
  }

  if (isDefined(opts.user)) {
    envs[`${envPrefix}_USER`] = String(opts.user);
  }

  if (isDefined(opts.password)) {
    envs[`${envPrefix}_PASSWORD`] = String(opts.password);
  }

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'presto',
    server: { env: `${envPrefix}_SERVER` },
    port: { env: `${envPrefix}_PORT` },
    catalog: { env: `${envPrefix}_CATALOG` },
    schema: { env: `${envPrefix}_SCHEMA` },
    user: { env: `${envPrefix}_USER` },
    password: { env: `${envPrefix}_PASSWORD` }
  };

  let malloyConfigPart: MalloyConfigPart = {
    malloyConnectionConfigEntry: malloyConnectionConfigEntry,
    envs: envs,
    files: files
  };

  return malloyConfigPart;
}
