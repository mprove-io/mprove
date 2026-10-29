import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makePgMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.postgres;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  let username: string = encodeURIComponent(opts.username ?? '');

  let password: string = encodeURIComponent(opts.password ?? '');

  let host = opts.host ?? '';

  let port = opts.port ?? 5432;

  let database: string = encodeURIComponent(opts.database ?? '');

  let connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}`;

  if (opts.isSSL === true) {
    connectionString += '?sslmode=no-verify';
  }

  envs[`${envPrefix}_CONNECTION_STRING`] = connectionString;

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'postgres',
    connectionString: { env: `${envPrefix}_CONNECTION_STRING` }
  };

  let malloyConfigPart: MalloyConfigPart = {
    malloyConnectionConfigEntry: malloyConnectionConfigEntry,
    envs: envs,
    files: files
  };

  return malloyConfigPart;
}
