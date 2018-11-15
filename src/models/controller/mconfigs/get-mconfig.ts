import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function getMconfig(req: Request, res: Response) {
  let payload: api.GetMconfigRequestBodyPayload = validator.getPayload(req);

  let mconfigId = payload.mconfig_id;

  let storeMconfigs = store.getMconfigsRepo();

  let mconfig = await storeMconfigs
    .findOne({ mconfig_id: mconfigId })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_FIND_ONE)
    );

  if (!mconfig) {
    throw new ServerError({ name: enums.otherErrorsEnum.MCONFIG_NOT_FOUND });
  }

  // response

  let responsePayload: api.GetMconfigResponse200BodyPayload = {
    mconfig_or_empty: mconfig ? [wrapper.wrapToApiMconfig(mconfig)] : []
  };

  sender.sendClientResponse(req, res, responsePayload);
}
