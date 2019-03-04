import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { MyRegex } from '../../models/my-regex';
import { ServerError } from '../../models/server-error';

export async function findAlias(userId: string) {

  let reg = MyRegex.CAPTURE_ALIAS();
  let r = reg.exec(userId);

  let alias = r ? r[1] : undefined;

  if (!alias) {
    throw new ServerError({ name: enums.otherErrorsEnum.EMAIL_ALIAS });
  }

  let count = 2;

  let restart = true;

  while (restart) {

    let storeUsers = store.getUsersRepo();

    let aliasUser = await storeUsers.findOne({
      alias: alias
    })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE));

    if (aliasUser) {
      // retry
      alias = `${alias}${count}`;
      count++;

    } else {
      // ok
      restart = false;
    }
  }

  return alias;
}
