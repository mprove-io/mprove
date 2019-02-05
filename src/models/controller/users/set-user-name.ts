import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function usersSetUserName(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.SetUserNameRequestBody['payload'] = validator.getPayload(
    req
  );

  let firstName = payload.first_name;
  let lastName = payload.last_name;
  let serverTs = payload.server_ts;

  let storeUsers = store.getUsersRepo();
  let storeMembers = store.getMembersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({ name: enums.otherErrorsEnum.USER_NOT_FOUND });
  }

  helper.checkServerTs(user, serverTs);

  user.first_name = firstName;
  user.last_name = lastName;

  let userMembers = <entities.MemberEntity[]>await storeMembers
    .find({
      // including deleted
      member_id: userId
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND));

  userMembers.map(member => {
    member.first_name = firstName;
    member.last_name = lastName;
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
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.SetUserNameResponse200Body['payload'] = {
    user: wrapper.wrapToApiUser(user, enums.bEnum.FALSE),
    members: userMembers.map(member => wrapper.wrapToApiMember(member))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
