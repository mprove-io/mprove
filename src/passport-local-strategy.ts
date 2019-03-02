import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { entities } from './barrels/entities';
import { ServerError } from './models/server-error';
import { store } from './barrels/store';
import * as passportLocal from 'passport-local';
import * as crypto from 'crypto';

export const passportLocalStrategy = new passportLocal.Strategy(
  {
    usernameField: 'payload[]user_id',
    passwordField: 'payload[]password'
  },
  async (userId, password, done) => {
    try {
      let storeUsers = store.getUsersRepo();

      let user = <entities.UserEntity>(
        await storeUsers
          .findOne({ user_id: userId })
          .catch(e =>
            helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE)
          )
      );

      if (!user) {
        throw new ServerError({
          name: enums.otherErrorsEnum.LOGIN_ERROR_USER_DOES_NOT_EXIST
        });
      }

      if (user.deleted === enums.bEnum.TRUE) {
        throw new ServerError({
          name: enums.otherErrorsEnum.LOGIN_ERROR_USER_DELETED
        });
      }

      if (!user.hash) {
        throw new ServerError({
          name: enums.otherErrorsEnum.LOGIN_ERROR_REGISTER_TO_SET_PASSWORD
        });
      }

      let hash = crypto
        .pbkdf2Sync(password, user.salt, 1000, 64, 'sha512')
        .toString('hex');

      if (hash !== user.hash) {
        throw new ServerError({
          name: enums.otherErrorsEnum.LOGIN_ERROR_WRONG_PASSWORD
        });
      }

      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }
);
