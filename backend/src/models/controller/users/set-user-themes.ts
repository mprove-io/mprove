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

export async function setUserThemes(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.SetUserThemesRequestBody['payload'] = validator.getPayload(
    req
  );

  let mainTheme: api.UserMainThemeEnum = payload.main_theme;
  let dashTheme: api.UserDashThemeEnum = payload.dash_theme;
  let fileTheme: api.UserFileThemeEnum = payload.file_theme;
  let sqlTheme: api.UserSqlThemeEnum = payload.sql_theme;

  let serverTs = payload.server_ts;

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({ name: enums.otherErrorsEnum.USER_NOT_FOUND });
  }

  helper.checkServerTs(user, serverTs);

  user.main_theme = mainTheme;
  user.dash_theme = dashTheme;
  user.file_theme = fileTheme;
  user.sql_theme = sqlTheme;

  // update server_ts

  let newServerTs = helper.makeTs();

  user.server_ts = newServerTs;

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
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.SetUserThemesResponse200Body['payload'] = {
    user: wrapper.wrapToApiUser(user)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
