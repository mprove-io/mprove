import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { helper } from '../../../barrels/helper';

export async function verifyUserEmail(req: Request, res: Response) {
  let payload: api.VerifyUserEmailRequestBodyPayload = validator.getPayload(
    req
  );

  await helper.sendEmail({
    to: payload.user_id,
    subject: 'Verify your Mprove account',
    text: 'test'
  });

  let responsePayload: api.VerifyUserEmailResponse200BodyPayload = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
