import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makeDuckdbMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.motherduck;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  if (isDefined(opts.database)) {
    let dbValue: string = String(opts.database);

    if (!dbValue.startsWith('md:')) {
      dbValue = `md:${dbValue}`;
    }

    // attach_mode and saas_mode are baked into databasePath
    // because Malloy passes it directly to DuckDBInstance.create()
    let dbPath =
      opts.attachModeSingle === true && dbValue.length > 3
        ? `${dbValue}?attach_mode=single&saas_mode=true`
        : `${dbValue}?saas_mode=true`;

    envs[`${envPrefix}_DATABASE`] = dbPath;
  }

  if (isDefined(opts.motherduckToken)) {
    envs[`${envPrefix}_MOTHERDUCK_TOKEN`] = String(opts.motherduckToken);
  }

  // accessModeReadOnly is consumed via readOnly in malloy config entry
  if (isDefined(opts.accessModeReadOnly)) {
    envs[`${envPrefix}_ACCESS_MODE_READ_ONLY`] = String(
      opts.accessModeReadOnly
    );
  }

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'duckdb',
    databasePath: { env: `${envPrefix}_DATABASE` },
    motherDuckToken: { env: `${envPrefix}_MOTHERDUCK_TOKEN` },
    readOnly: { env: `${envPrefix}_ACCESS_MODE_READ_ONLY` }
  };

  let malloyConfigPart: MalloyConfigPart = {
    malloyConnectionConfigEntry: malloyConnectionConfigEntry,
    envs: envs,
    files: files
  };

  return malloyConfigPart;
}
