import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';

export type OptionsToDuckdbOptionsOutput = {
  duckdbConnectionOptions: Record<string, string>;
  dbPath: string;
};

export function optionsToDuckdbOptions(item: {
  connection: ConnectionTab;
}): OptionsToDuckdbOptionsOutput {
  let { connection } = item;

  let dbPath =
    connection.options.motherduck.attachModeSingle === true &&
    connection.options.motherduck.database?.length > 0
      ? `md:${connection.options.motherduck.database}?attach_mode=single&saas_mode=true`
      : `md:${connection.options.motherduck.database}?saas_mode=true`;

  let duckdbConnectionOptions: Record<string, string> = {
    motherduck_token: connection.options.motherduck.motherduckToken
  };

  if (connection.options.motherduck.accessModeReadOnly === true) {
    duckdbConnectionOptions.access_mode = 'READ_ONLY';
  }

  let optionsToDuckdbOptionsOutput: OptionsToDuckdbOptionsOutput = {
    duckdbConnectionOptions: duckdbConnectionOptions,
    dbPath: dbPath
  };

  return optionsToDuckdbOptionsOutput;
}
