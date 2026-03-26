import type { ToBackendGetModelResponsePayload } from '#common/interfaces/to-backend/models/to-backend-get-model';

export function processGetModelPayload(item: {
  payload: ToBackendGetModelResponsePayload;
}) {
  let { payload } = item;

  return {
    needValidate: payload.needValidate,
    model: payload.model
  };
}
