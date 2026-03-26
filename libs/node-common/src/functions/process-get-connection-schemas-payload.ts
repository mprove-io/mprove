import type { ToBackendGetConnectionSchemasResponsePayload } from '#common/interfaces/to-backend/connections/to-backend-get-connection-schemas';

export function processGetConnectionSchemasPayload(item: {
  payload: ToBackendGetConnectionSchemasResponsePayload;
}) {
  let { payload } = item;

  return {
    combinedSchemaItems: payload.combinedSchemaItems
  };
}
