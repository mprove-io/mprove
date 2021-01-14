import * as apiEnums from '../enums/_index';
import * as apiObjects from '../objects/_index';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  request: any;
  e: any;
}): apiObjects.ErrorResponse {
  let wrappedError = wrapError(item.e);

  let info: apiObjects.ResponseInfo = {
    traceId: item.request.info?.traceId,
    status: apiEnums.ResponseInfoStatusEnum.Error,
    error: wrappedError
  };

  let response: apiObjects.ErrorResponse = {
    info: info,
    payload: {}
  };

  return response;
}
