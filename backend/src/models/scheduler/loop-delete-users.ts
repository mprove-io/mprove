import { In } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { proc } from '../../barrels/proc';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { wrapper } from '../../barrels/wrapper';
import * as WebSocket from 'ws';
import { getSessionsRepo } from '../store/_index';
import { config } from '../../barrels/config';

let cron = require('cron');

export function loopDeleteUsers() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deleteUsers().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_USERS)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function deleteUsers() {
  let currentTs = helper.makeTs();

  let tsInPast = Number(currentTs) - config.DELETE_USERS_CUTOFF;

  let storeUsers = store.getUsersRepo();

  let users = <entities.UserEntity[]>await storeUsers
    .createQueryBuilder()
    .select()
    .where(`server_ts < :ts`, { ts: tsInPast })
    .andWhere(`deleted = :benum_true`, { benum_true: enums.bEnum.TRUE })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_QUERY_BUILDER)
    );

  let userIds = users.map(x => x.user_id);

  if (userIds.length > 0) {
    await storeUsers
      .delete({
        user_id: In(userIds)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_DELETE));
  }
}
