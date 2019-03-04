import { Request } from 'express';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { ServerError } from '../server-error';

export function getRequestInfoInitId(req: Request) {

  let initId;
  let error;

  try {
    initId = req.body.info.init_id;

  } catch (e) {
    error = true;
  }

  if (error || helper.isNullOrEmpty(initId)) {
    throw new ServerError({ name: enums.otherErrorsEnum.API });
  }

  return initId;
}
