import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { helper } from '../../../barrels/helper';
import { entities } from '../../../barrels/entities';
import { store } from '../../../barrels/store';
import { enums } from '../../../barrels/enums';
import { ServerError } from '../../../models/server-error';
import { getConnection } from 'typeorm';

export async function confirmUserEmail(req: Request, res: Response) {
  let payload: api.ConfirmUserEmailRequestBodyPayload = validator.getPayload(
    req
  );

  let token = payload.token;

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne({ email_verification_token: token })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({
      name: enums.otherErrorsEnum.CONFIRM_EMAIL_ERROR_USER_DOES_NOT_EXIST
    });
  } else if (user.email_verified === enums.bEnum.FALSE) {
    let newServerTs = helper.makeTs();
    user.server_ts = newServerTs;
    user.email_verified = enums.bEnum.TRUE;

    // save to database

    let connection = getConnection();

    await connection
      .transaction(async manager => {
        await store
          .save({
            manager: manager,
            records: {
              users: [user]
            },
            server_ts: newServerTs,
            skip_chunk: true,
            source_init_id: undefined
          })
          .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
      })
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
      );
  }

  let responsePayload: api.ConfirmUserEmailResponse200BodyPayload = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
