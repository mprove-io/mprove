import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';
import * as jsonwebtoken from 'jsonwebtoken';

import * as crypto from 'crypto';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';
import { store } from '../../../barrels/store';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';
import { ServerError } from '../../server-error';
import { git } from '../../../barrels/git';
import { interfaces } from '../../../barrels/interfaces';
import { disk } from '../../../barrels/disk';
import { copier } from '../../../barrels/copier';
import { getConnection } from 'typeorm';

import * as passport from 'passport';
import { auth } from '../../../barrels/auth';

export async function loginUser(req: Request, res: Response) {
  let payload: api.RegisterUserRequestBodyPayload = validator.getPayload(req);

  passport.authenticate('local', (err, user, info) => {
    let token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (user) {
      token = auth.generateJwt(user.email);

      // res.status(200);
      // res.json({
      //   token: token
      // });

      let responsePayload: api.LoginUserResponse200BodyPayload = {
        token: token
      };

      sender.sendClientResponse(req, res, responsePayload);
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
}
