import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makeSnowflakeMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.snowflake;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  if (isDefined(opts.account)) {
    envs[`${envPrefix}_ACCOUNT`] = String(opts.account);
  }

  if (isDefined(opts.warehouse)) {
    envs[`${envPrefix}_WAREHOUSE`] = String(opts.warehouse);
  }

  if (isDefined(opts.database)) {
    envs[`${envPrefix}_DATABASE`] = String(opts.database);
  }

  if (isDefined(opts.username)) {
    envs[`${envPrefix}_USERNAME`] = String(opts.username);
  }

  if (isDefined(opts.password)) {
    envs[`${envPrefix}_PASSWORD`] = String(opts.password);
  }

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'snowflake',
    account: { env: `${envPrefix}_ACCOUNT` },
    warehouse: { env: `${envPrefix}_WAREHOUSE` },
    database: { env: `${envPrefix}_DATABASE` },
    username: { env: `${envPrefix}_USERNAME` },
    password: { env: `${envPrefix}_PASSWORD` }
  };

  let malloyConfigPart: MalloyConfigPart = {
    malloyConnectionConfigEntry: malloyConnectionConfigEntry,
    envs: envs,
    files: files
  };

  return malloyConfigPart;
}
