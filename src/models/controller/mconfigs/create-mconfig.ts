import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';

export async function createMconfig(req: Request, res: Response) {

  let initId = validator.getRequestInfoInitId(req);

  let payload: api.CreateMconfigRequestBodyPayload = validator.getPayload(req);

  let mconfigApi = payload.mconfig;

  let mconfig = wrapper.wrapToEntityMconfig(mconfigApi);

  // update server_ts

  let newServerTs = helper.makeTs();

  mconfig.server_ts = newServerTs;

  // save to database

  let connection = getConnection();

  await connection.transaction(async manager => {

    await store.insert({
      manager: manager,
      records: {
        mconfigs: [mconfig],
      },
      server_ts: newServerTs,
      skip_chunk: true, // mconfig is temp, other sessions does not need to be updated
      source_init_id: initId,
    })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));

  })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.CreateMconfigResponse200BodyPayload = {
    mconfig: wrapper.wrapToApiMconfig(mconfig),
  };

  sender.sendClientResponse(req, res, responsePayload);
}
