import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ConnectionOptions } from '#common/types/backend/parts/connection-parts/connection-options';

export function cleanInternalFields(item: {
  options: ConnectionOptions;
}): void {
  let { options } = item;

  if (isDefined(options.postgres)) {
    let hostSet =
      isDefined(options.postgres.internalHost) &&
      options.postgres.internalHost !== '';

    let portSet =
      isDefined(options.postgres.internalPort) &&
      options.postgres.internalPort !== 0;

    if (!hostSet || !portSet) {
      options.postgres.internalHost = undefined;
      options.postgres.internalPort = undefined;
    }
  }

  if (isDefined(options.mysql)) {
    let hostSet =
      isDefined(options.mysql.internalHost) &&
      options.mysql.internalHost !== '';

    let portSet =
      isDefined(options.mysql.internalPort) && options.mysql.internalPort !== 0;

    if (!hostSet || !portSet) {
      options.mysql.internalHost = undefined;
      options.mysql.internalPort = undefined;
    }
  }

  if (isDefined(options.presto)) {
    let serverSet =
      isDefined(options.presto.internalServer) &&
      options.presto.internalServer !== '';

    let portSet =
      isDefined(options.presto.internalPort) &&
      options.presto.internalPort !== 0;

    if (!serverSet || !portSet) {
      options.presto.internalServer = undefined;
      options.presto.internalPort = undefined;
    }
  }

  if (isDefined(options.trino)) {
    let serverSet =
      isDefined(options.trino.internalServer) &&
      options.trino.internalServer !== '';

    if (!serverSet) {
      options.trino.internalServer = undefined;
    }
  }

  if (isDefined(options.databricks)) {
    let hostSet =
      isDefined(options.databricks.internalHost) &&
      options.databricks.internalHost !== '';

    if (!hostSet) {
      options.databricks.internalHost = undefined;
    }
  }
}
