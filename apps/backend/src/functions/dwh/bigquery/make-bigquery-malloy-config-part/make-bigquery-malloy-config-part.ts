import type { ConnectionConfigEntry } from '@malloydata/malloy';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export function makeBigqueryMalloyConfigPart(item: {
  connection: ConnectionTab;
  envPrefix: string;
}): MalloyConfigPart {
  let { connection, envPrefix } = item;

  let opts = connection.options.bigquery;

  let envs: Record<string, string> = {};

  let files: { path: string; data: string }[] = [];

  if (isDefined(opts.googleCloudProject)) {
    envs[`${envPrefix}_GOOGLE_CLOUD_PROJECT`] = String(opts.googleCloudProject);
  }

  if (isDefined(opts.bigqueryQuerySizeLimitGb)) {
    envs[`${envPrefix}_BIGQUERY_QUERY_SIZE_LIMIT_GB`] = String(
      opts.bigqueryQuerySizeLimitGb
    );
  }

  let malloyConnectionConfigEntry: ConnectionConfigEntry = {
    is: 'bigquery',
    projectId: { env: `${envPrefix}_GOOGLE_CLOUD_PROJECT` }
  };

  if (isDefined(opts.serviceAccountCredentials)) {
    let credPath = `/home/user/.config/mprove/connections/${connection.connectionId}/service-account-credentials.json`;

    envs[`${envPrefix}_SERVICE_ACCOUNT_CREDENTIALS_PATH`] = credPath;

    files.push({
      path: credPath,
      data:
        typeof opts.serviceAccountCredentials === 'string'
          ? opts.serviceAccountCredentials
          : JSON.stringify(opts.serviceAccountCredentials, null, 2)
    });

    malloyConnectionConfigEntry.serviceAccountKeyPath = credPath;
  }

  let malloyConfigPart: MalloyConfigPart = {
    malloyConnectionConfigEntry: malloyConnectionConfigEntry,
    envs: envs,
    files: files
  };

  return malloyConfigPart;
}
