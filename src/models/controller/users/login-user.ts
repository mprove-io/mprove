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
  let payload: api.RegisterUserRequestBody['payload'] = validator.getPayload(
    req
  );

  passport.authenticate(
    'local',
    async (err, user: entities.UserEntity, info) => {
      if (err) {
        return next(err);
      }

      let userId = user.user_id;

      let responsePayload: api.LoginUserResponse200Body['payload'];

      if (user.email_verified === enums.bEnum.FALSE) {
        responsePayload = {
          email_verified: false,
          user_id: userId
        };
      } else if (user.email_verified === enums.bEnum.TRUE) {
        if (user.status === api.UserStatusEnum.Pending) {
          user.status = api.UserStatusEnum.Active;

          let storeMembers = store.getMembersRepo();

          let userMembers = <entities.MemberEntity[]>await storeMembers
            .find({
              // including deleted
              member_id: userId
            })
            .catch(e =>
              helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND)
            );

          userMembers.map(member => {
            member.status = api.UserStatusEnum.Active;
          });

          // update server_ts

          let newServerTs = helper.makeTs();

          user.server_ts = newServerTs;
          userMembers = helper.refreshServerTs(userMembers, newServerTs);

          // save to database

          let connection = getConnection();

          await connection
            .transaction(async manager => {
              await store
                .save({
                  manager: manager,
                  records: {
                    users: [user],
                    members: userMembers
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

        let token = auth.generateJwt(userId);
        responsePayload = {
          email_verified: true,
          token: token
        };
      }

      sender.sendClientResponse(req, res, responsePayload);
    }
  )(req, res);
}
