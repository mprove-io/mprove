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

export async function editMember(req: Request, res: Response) {

  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.EditMemberRequestBodyPayload = validator.getPayload(req);

  let projectId = payload.project_id;
  let memberId = payload.member_id;
  let isEditor = helper.booleanToBenum(payload.is_editor);
  let isAdmin = helper.booleanToBenum(payload.is_admin);
  let mainTheme: api.MemberMainThemeEnum = <any>payload.main_theme;
  let dashTheme: api.MemberDashThemeEnum = <any>payload.dash_theme;
  let fileTheme: api.MemberFileThemeEnum = <any>payload.file_theme;
  let sqlTheme: api.MemberSqlThemeEnum = <any>payload.sql_theme;
  let serverTs = payload.server_ts;

  let storeMembers = store.getMembersRepo();

  let memberTo = <entities.MemberEntity>await storeMembers.findOne({ // including deleted
    project_id: projectId,
    member_id: memberId,
  })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND_ONE));

  if (!memberTo) {
    throw new ServerError({ name: enums.otherErrorsEnum.MEMBER_NOT_FOUND });
  }

  if (memberTo.deleted === enums.bEnum.TRUE) {
    throw new ServerError({ name: enums.otherErrorsEnum.MEMBER_IS_DELETED });
  }

  helper.checkServerTs(memberTo, serverTs);

  let memberFrom = <entities.MemberEntity>await storeMembers.findOne({ // including deleted
    project_id: projectId,
    member_id: userId,
  })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND_ONE));

  if (!memberFrom) { throw new ServerError({ name: enums.otherErrorsEnum.MEMBER_NOT_FOUND }); }

  if (memberFrom.is_admin === enums.bEnum.FALSE) { // user is not admin

    if (userId === memberId) { // changing himself

      if (isEditor !== memberTo.is_editor ||
        isAdmin !== memberTo.is_admin) {
        throw new ServerError({ name: enums.otherErrorsEnum.USER_IS_NOT_ADMIN });
      } else {
        // ok - editing themes
      }

    } else { // changing another
      throw new ServerError({ name: enums.otherErrorsEnum.USER_IS_NOT_ADMIN });
    }

  } else { // user is admin

    if (userId === memberId) { // changing himself

      if (isAdmin !== memberTo.is_admin) {

        throw new ServerError({ name: enums.otherErrorsEnum.USER_CAN_NOT_CHANGE_HIS_ADMIN_STATUS });

      } else {
        // ok - editing themes
        // ok - editing is_editor
      }

    } else { // changing another

      if (mainTheme !== memberTo.main_theme ||
        dashTheme !== memberTo.dash_theme ||
        fileTheme !== memberTo.file_theme ||
        sqlTheme !== memberTo.sql_theme) {

        throw new ServerError({ name: enums.otherErrorsEnum.USER_CAN_NOT_CHANGE_MEMBER_THEMES });

      } else {
        // ok - editing is_editor
        // ok - editing is_admin
      }
    }
  }

  memberTo.is_admin = isAdmin;
  memberTo.is_editor = isEditor;
  memberTo.main_theme = mainTheme;
  memberTo.dash_theme = dashTheme;
  memberTo.sql_theme = sqlTheme;
  memberTo.file_theme = fileTheme;

  // update server_ts
  let newServerTs = helper.makeTs();

  memberTo.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection.transaction(async manager => {

    await store.save({
      manager: manager,
      records: {
        members: [memberTo],
      },
      server_ts: newServerTs,
      source_init_id: initId,
    })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));

  })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  let responsePayload: api.EditMemberResponse200BodyPayload = {
    member: wrapper.wrapToApiMember(memberTo)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
