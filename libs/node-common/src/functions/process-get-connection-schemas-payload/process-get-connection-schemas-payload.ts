import type { ToBackendGetConnectionSchemasOutput } from '#common/zod/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';

export function processGetConnectionSchemasPayload(item: {
  payload: ToBackendGetConnectionSchemasOutput;
}) {
  let { payload } = item;

  return {
    combinedSchemaItems: payload.combinedSchemaItems
  };
}
