import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cleanInternalFields } from '#backend/functions/db/connections/clean-internal-fields/clean-internal-fields';
import type { HashService } from '#backend/services/hash/hash.service';
import { DEFAULT_QUERY_SIZE_LIMIT } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ConnectionOptions } from '#common/types/backend/parts/connection-parts/connection-options';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';

export function makeConnection(item: {
  hashService: HashService;
  projectId: string;
  connectionId: string;
  envId: string;
  type: ConnectionType;
  options: ConnectionOptions;
}): ConnectionTab {
  let { hashService, projectId, connectionId, envId, type, options } = item;

  cleanInternalFields({ options: options });

  if (isDefined(options.storeGoogleApi)) {
    options.storeGoogleApi.googleCloudProject =
      options.storeGoogleApi.serviceAccountCredentials?.project_id;

    options.storeGoogleApi.googleCloudClientEmail =
      options.storeGoogleApi.serviceAccountCredentials?.client_email;
  }

  if (isDefined(options.bigquery)) {
    options.bigquery.googleCloudProject =
      options.bigquery.serviceAccountCredentials?.project_id;

    options.bigquery.googleCloudClientEmail =
      options.bigquery.serviceAccountCredentials?.client_email;

    let slimit = options.bigquery.bigqueryQuerySizeLimitGb;

    options.bigquery.bigqueryQuerySizeLimitGb =
      isDefined(slimit) && slimit > 0 ? slimit : DEFAULT_QUERY_SIZE_LIMIT;
  }

  let connection: ConnectionTab = {
    connectionFullId: hashService.makeConnectionFullId({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId
    }),
    projectId: projectId,
    envId: envId,
    connectionId: connectionId,
    type: type,
    options: options,
    keyTag: undefined,
    serverTs: undefined
  };

  return connection;
}
