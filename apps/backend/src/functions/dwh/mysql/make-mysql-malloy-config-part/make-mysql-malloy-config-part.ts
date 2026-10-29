import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makeMysqlMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.mysql;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  if (isDefined(opts.host)) {
    envs[`${envPrefix}_HOST`] = String(opts.host);
  }

  if (isDefined(opts.port)) {
    envs[`${envPrefix}_PORT`] = String(opts.port);
  }

  if (isDefined(opts.database)) {
    envs[`${envPrefix}_DATABASE`] = String(opts.database);
  }

  if (isDefined(opts.user)) {
    envs[`${envPrefix}_USER`] = String(opts.user);
  }

  if (isDefined(opts.password)) {
    envs[`${envPrefix}_PASSWORD`] = String(opts.password);
  }

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'mysql',
    host: { env: `${envPrefix}_HOST` },
    port: { env: `${envPrefix}_PORT` },
    database: { env: `${envPrefix}_DATABASE` },
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
