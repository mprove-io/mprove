import { Request } from 'express';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { ServerError } from '../server-error';

export function getPayload(req: Request) {
  let payload;
  let err;

  try {
    payload = req.body.payload;
  } catch (e) {
    err = true;
  }

  if (err || helper.isNullOrEmpty(payload)) {
    throw new ServerError({ name: enums.otherErrorsEnum.API_ERROR });
  }

  return payload;
}
