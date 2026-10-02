import type { ToBackendGetConnectionSchemasOutput } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';

export function processGetConnectionSchemasPayload(item: {
  payload: ToBackendGetConnectionSchemasOutput;
}) {
  let { payload } = item;

  return {
    combinedSchemaItems: payload.combinedSchemaItems
  };
}
