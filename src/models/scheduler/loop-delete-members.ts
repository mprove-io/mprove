import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { config } from '../../barrels/config';
import { forEach } from 'p-iteration';
import { disk } from '../../barrels/disk';

let cron = require('cron');

export function loopDeleteMembers() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (isCronJobRunning) {
      console.log(`${loopDeleteMembers.name} skip`);
    }

    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deleteMembers().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_MEMBERS)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function deleteMembers() {
  let currentTs = helper.makeTs();

  let tsInPast = Number(currentTs) - config.DELETE_MEMBERS_CUTOFF;

  let storeMembers = store.getMembersRepo();
  let storeRepos = store.getReposRepo();
  let storeFiles = store.getFilesRepo();
  let storeErrors = store.getErrorsRepo();
  let storeModels = store.getModelsRepo();
  let storeMconfigs = store.getMconfigsRepo();
  let storeDashboards = store.getDashboardsRepo();

  let members = <entities.MemberEntity[]>await storeMembers
    .createQueryBuilder()
    .select()
    .where(`server_ts < :ts`, { ts: tsInPast })
    .andWhere(`deleted = :benum_true`, { benum_true: enums.bEnum.TRUE })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_QUERY_BUILDER)
    );

  await forEach(members, async member => {
    let memberId = member.member_id;
    let projectId = member.project_id;

    await storeMembers
      .delete({
        member_id: memberId,
        project_id: projectId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_DELETE)
      );

    await storeRepos
      .delete({
        repo_id: memberId,
        project_id: projectId
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_DELETE));

    await storeFiles
      .delete({
        repo_id: memberId,
        project_id: projectId
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_DELETE));

    await storeErrors
      .delete({
        repo_id: memberId,
        project_id: projectId
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_DELETE));

    await storeDashboards
      .delete({
        repo_id: memberId,
        project_id: projectId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_DELETE)
      );

    await storeMconfigs
      .delete({
        repo_id: memberId,
        project_id: projectId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_DELETE)
      );

    await storeModels
      .delete({
        repo_id: memberId,
        project_id: projectId
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_DELETE));

    // disk

    await disk
      .removePath(`${config.DISK_BASE_PATH}/${projectId}/${memberId}`)
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_REMOVE_PATH));
  });
}
