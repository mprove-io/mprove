import { Request } from 'express';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { ServerError } from '../server-error';

export function getInfoRequestId(req: Request) {
  let requestId;
  let error;

  try {
    requestId = req.body.info.request_id;
  } catch (e) {
    error = true;
  }

  if (error || helper.isNullOrEmpty(requestId)) {
    throw new ServerError({ name: enums.otherErrorsEnum.API_ERROR });
  }

  return requestId;
}
