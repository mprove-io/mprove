import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';

export async function logoutUser(req: Request, res: Response) {
  let userId: string = req.user.email;

  let payload: api.LogoutUserRequestBody['payload'] = validator.getPayload(req);

  let responsePayload: api.LogoutUserResponse200Body['payload'] = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
