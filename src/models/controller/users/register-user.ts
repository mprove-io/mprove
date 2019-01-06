import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';
import * as jsonwebtoken from 'jsonwebtoken';

import * as crypto from 'crypto';

export async function registerUser(req: Request, res: Response) {
  // let userId: string = req.user.email;

  let userId = 'mike@example.com';

  let password = '123';

  let alias = await proc.findAlias(userId);

  let salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');

  let newUser = generator.makeUser({
    user_id: userId,
    hash: hash,
    salt: salt,
    alias: alias,
    status: api.UserStatusEnum.Active
  });

  // let payload: api.LogoutUserRequestBodyPayload = validator.getPayload(req);

  // let responsePayload: api.LogoutUserResponse200BodyPayload = {
  //   empty: true
  // };

  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  let token = jsonwebtoken.sign(
    {
      user_id: userId,
      exp: parseInt((expiry.getTime() / 1000).toString(), 10)
    },
    'MY_SECRET'
  );

  let responsePayload = {
    token: token
  };

  sender.sendClientResponse(req, res, responsePayload);
}
