import { getConnection } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { validator } from '../../barrels/validator';
import { ServerError } from '../server-error';

// TODO: implement activateUser middleware

export async function activateUser(req: any, res: any, next: any) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string;

  try {
    userId = req.user.email;
    if (helper.isNullOrEmpty(userId)) {
      throw new Error();
    }
  } catch (e) {
    throw new ServerError({ name: enums.otherErrorsEnum.AUTHORIZATION_EMAIL_ERROR });
  }

  if (helper.isNotNullAndNotEmpty(userId)) {
    let storeUsers = store.getUsersRepo();

    let user = <entities.UserEntity>(
      await storeUsers
        .findOne(userId)
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE)
        )
    );

    if (user && user.status !== api.UserStatusEnum.Active) {
      user.status = api.UserStatusEnum.Active;

      let storeMembers = store.getMembersRepo();

      let userMembers = <entities.MemberEntity[]>await storeMembers
        .find({
          member_id: userId
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND)
        );

      userMembers = userMembers.map(member => {
        member.status = api.UserStatusEnum.Active;
        return member;
      });

      let newServerTs = helper.makeTs();

      user.server_ts = newServerTs;
      userMembers = helper.refreshServerTs(userMembers, newServerTs);

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
            .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
        })
        .catch(e =>
          helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
        );
    }

    next();
  }
}
