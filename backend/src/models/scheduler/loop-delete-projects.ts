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

export function loopDeleteProjects() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('* * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deleteProjects().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_PROJECTS)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function deleteProjects() {
  let currentTs = helper.makeTs();

  let tsInPast = Number(currentTs) - config.DELETE_PROJECTS_CUTOFF;

  let storeProjects = store.getProjectsRepo();

  let projects = <entities.ProjectEntity[]>await storeProjects
    .createQueryBuilder()
    .select()
    .where(`server_ts < :ts`, { ts: tsInPast })
    .andWhere(`deleted = :benum_true`, { benum_true: enums.bEnum.TRUE })
    .getMany()
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_QUERY_BUILDER)
    );

  let projectIds = projects.map(x => x.project_id);

  if (projectIds.length > 0) {
    await proc.processDeletedProjects(projectIds);
  }
}
