import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { auth } from '../../../barrels/auth';
import * as passport from 'passport';

export async function loginUser(req: Request, res: Response, next: any) {
  let payload: api.RegisterUserRequestBodyPayload = validator.getPayload(req);

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    let token = auth.generateJwt(user.email);

    let responsePayload: api.LoginUserResponse200BodyPayload = {
      token: token
    };

    sender.sendClientResponse(req, res, responsePayload);
  })(req, res);
}
