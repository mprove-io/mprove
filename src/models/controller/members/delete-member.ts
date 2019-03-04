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

export async function deleteMember(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.DeleteMemberRequestBody['payload'] = validator.getPayload(
    req
  );

  let projectId = payload.project_id;
  let memberId = payload.member_id;
  let serverTs = payload.server_ts;

  let storeMembers = store.getMembersRepo();

  let memberTo = <entities.MemberEntity>await storeMembers
    .findOne({
      // including deleted
      project_id: projectId,
      member_id: memberId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND_ONE)
    );

  if (!memberTo) {
    throw new ServerError({ name: enums.otherErrorsEnum.MEMBER_NOT_FOUND });
  }

  if (memberTo.deleted === enums.bEnum.TRUE) {
    throw new ServerError({ name: enums.otherErrorsEnum.MEMBER_IS_DELETED });
  }

  helper.checkServerTs(memberTo, serverTs);

  // let storeMembers = store.getMembersRepo();

  let memberFrom = <entities.MemberEntity>await storeMembers
    .findOne({
      // including deleted
      project_id: projectId,
      member_id: userId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND_ONE)
    );

  if (!memberFrom) {
    throw new ServerError({ name: enums.otherErrorsEnum.MEMBER_NOT_FOUND });
  }

  if (memberFrom.is_admin === enums.bEnum.FALSE) {
    // user is not admin

    throw new ServerError({ name: enums.otherErrorsEnum.USER_IS_NOT_ADMIN });
  } else {
    // user is admin

    if (userId === memberId) {
      // deleting himself

      throw new ServerError({
        name: enums.otherErrorsEnum.USER_CAN_NOT_DELETE_HIMSELF
      });
    } else {
      // deleting another
      // ok
    }
  }

  memberTo.deleted = enums.bEnum.TRUE;

  // update server_ts
  let newServerTs = helper.makeTs();

  memberTo.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            members: [memberTo]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  let responsePayload: api.DeleteMemberResponse200Body['payload'] = {
    member: wrapper.wrapToApiMember(memberTo)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
