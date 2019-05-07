import { In, Not, Equal } from 'typeorm';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
const { BigQuery } = require('@google-cloud/bigquery');
import { forEach } from 'p-iteration';

let cron = require('cron');

export function loopDeletePdts() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('0 * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deletePdts().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_QUERIES)
        );
      } catch (err) {
        handler.errorToLog(err);
      }

      isCronJobRunning = false;
    }
  });

  cronJob.start();
}

async function deletePdts() {
  let storeProjects = store.getProjectsRepo();
  let storeRepos = store.getReposRepo();

  let projects = <entities.ProjectEntity[]>await storeProjects
    .find({
      deleted: Equal(enums.bEnum.FALSE),
      has_credentials: Equal(enums.bEnum.TRUE)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND));

  let repos = <entities.RepoEntity[]>(
    await storeRepos
      .find()
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND))
  );

  await forEach(projects, async project => {
    let projectStructIds = repos
      .filter(repo => repo.project_id === project.project_id)
      .map(x => x.struct_id);

    let bigquery = new BigQuery({
      projectId: project.bigquery_project,
      keyFilename: project.bigquery_credentials_file_path
    });

    const [tables] = await bigquery
      .dataset(`mprove_${project.project_id}`)
      .getTables();

    if (tables && tables.length > 0) {
      await forEach(tables, async (table: any) => {
        let tableId = table.id;
        let tableStructId = tableId.substring(0, tableId.indexOf('_'));

        if (projectStructIds.indexOf(tableStructId) < 0) {
          let bigqueryTable = bigquery
            .dataset(`mprove_${project.project_id}`)
            .table(tableId);

          let itemTableDelete = await bigqueryTable
            .delete()
            .catch((e: any) =>
              helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_TABLE_DELETE)
            );
        }
      });
    }
  });
}
