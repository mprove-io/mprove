import { In, Not } from 'typeorm';
import { entities } from '../../barrels/entities';
import { constants } from '../../barrels/constants';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { proc } from '../../barrels/proc';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';

let cron = require('cron');

export function loopCheckDemo() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopCheckDemo.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await checkDemo().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_CHECK_DEMO)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function checkDemo() {
  let storeUsers = store.getUsersRepo();
  let storeMembers = store.getMembersRepo();

  let demoMembers = <entities.MemberEntity[]>await storeMembers
    .find({
      project_id: In([constants.DEMO_PROJECT])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND));

  let demoMemberIds = demoMembers.map(x => x.member_id);

  let users;

  if (demoMemberIds.length > 0) {
    users = <entities.UserEntity[]>await storeUsers
      .find({
        user_id: Not(In([demoMemberIds]))
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND));
  } else {
    users = <entities.UserEntity[]>await storeUsers.find();
  }

  await Promise.all(
    users.map(async user =>
      proc.addMemberToDemo(user).catch(e => {
        try {
          helper.reThrow(e, enums.procErrorsEnum.PROC_PROCESS_WAITING_QUERY);
        } catch (err) {
          handler.errorToLog(err);
        }
      })
    )
  ).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));
}
