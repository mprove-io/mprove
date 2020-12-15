import * as apiEnums from '../enums/_index';
import * as apiObjects from '../objects/_index';
import { ServerError } from './server-error';

export function makeErrorResponse(item: {
  request: any;
  e: any;
}): apiObjects.ErrorResponse {
  let info: apiObjects.ResponseInfo = {
    traceId: item.request.info?.traceId,
    status:
      item.e instanceof ServerError
        ? apiEnums.ResponseInfoStatusEnum.DefinedError
        : apiEnums.ResponseInfoStatusEnum.UnknownError,
    error: {
      message: item.e.message || null,
      at: item.e.stack?.split('\n')[1] || null,
      data: item.e.data || null,
      stackArray: item.e.stack?.split('\n') || null,
      originalError: item.e.originalError || null,
      e: item.e instanceof ServerError ? null : item.e
    }
  };

  let response: apiObjects.ErrorResponse = {
    info: info,
    payload: {}
  };

  return response;
}
