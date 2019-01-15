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

export async function resetUserPassword(req: Request, res: Response) {
  let payload: api.ResetUserPasswordRequestBodyPayload = validator.getPayload(
    req
  );

  let userId = payload.user_id;

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({
      name: enums.otherErrorsEnum.RESET_PASSWORD_ERROR_USER_DOES_NOT_EXIST
    });
  }

  let newServerTs = helper.makeTs();
  user.server_ts = newServerTs;
  user.password_reset_expires_ts = helper.makeTsOffset(86400000);
  user.password_reset_token = helper.makeId();

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
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  let token = user.password_reset_token;

  let url = process.env.BACKEND_EMAIL_APP_HOST_URL
    ? process.env.BACKEND_EMAIL_APP_HOST_URL
    : payload.url;

  let link = `${url}/update-password?token=${token}`;

  await helper.sendEmail({
    to: userId,
    subject: 'Reset your Mprove password',
    text: `You requested password change. Click the link to set new password: ${link}`
  });

  let responsePayload: api.ResetUserPasswordResponse200BodyPayload = {
    user_id: userId
  };

  sender.sendClientResponse(req, res, responsePayload);
}
