import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { helper } from '../../../barrels/helper';
import { entities } from '../../../barrels/entities';
import { store } from '../../../barrels/store';
import { enums } from '../../../barrels/enums';
import { ServerError } from '../../../models/server-error';

export async function verifyUserEmail(req: Request, res: Response) {
  let payload: api.VerifyUserEmailRequestBodyPayload = validator.getPayload(
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
      name: enums.otherErrorsEnum.VERIFY_EMAIL_ERROR_USER_DOES_NOT_EXIST
    });
  }

  let token = user.email_verification_token;

  let url = process.env.BACKEND_EMAIL_APP_HOST_URL // TODO: document
    ? process.env.BACKEND_EMAIL_APP_HOST_URL
    : payload.url;

  let link = `${url}/confirm-email?token=${token}`;

  await helper.sendEmail({
    to: userId,
    subject: 'Verify your Mprove account',
    text: `Click the link to complete email verification: ${link}`
  });

  let responsePayload: api.VerifyUserEmailResponse200BodyPayload = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
