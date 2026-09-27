import type { ToBackendGetModelOutput } from '#common/zod/backend/routes/models/get-model/get-model-response';

export function processGetModelPayload(item: {
  payload: ToBackendGetModelOutput;
}) {
  let { payload } = item;

  return {
    needValidate: payload.needValidate,
    model: payload.model
  };
}
