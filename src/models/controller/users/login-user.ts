import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { enums } from '../../../barrels/enums';
import { auth } from '../../../barrels/auth';
import * as passport from 'passport';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';
import { getConnection } from 'typeorm';
import { store } from '../../../barrels/store';

export async function loginUser(req: Request, res: Response, next: any) {
  let payload: api.RegisterUserRequestBodyPayload = validator.getPayload(req);

  passport.authenticate(
    'local',
    async (err, user: entities.UserEntity, info) => {
      if (err) {
        return next(err);
      }

      let responsePayload: api.LoginUserResponse200BodyPayload;

      if (user.email_verified === enums.bEnum.FALSE) {
        responsePayload = {
          email_verified: false,
          user_id: user.user_id
        };
      } else if (user.email_verified === enums.bEnum.TRUE) {
        if (user.status === api.UserStatusEnum.Pending) {
          let newServerTs = helper.makeTs();
          user.server_ts = newServerTs;
          user.status = api.UserStatusEnum.Active;

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
                .catch(e =>
                  helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE)
                );
            })
            .catch(e =>
              helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
            );
        }

        let token = auth.generateJwt(user.user_id);
        responsePayload = {
          email_verified: true,
          token: token
        };
      }

      sender.sendClientResponse(req, res, responsePayload);
    }
  )(req, res);
}
