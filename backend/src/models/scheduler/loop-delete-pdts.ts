import { In, Not, Equal } from 'typeorm';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { handler } from '../../barrels/handler';
import { api } from '../../barrels/api';

import { forEachSeries } from 'p-iteration';
const { BigQuery } = require('@google-cloud/bigquery');

const pgp = require('pg-promise')({ noWarnings: true });
let cron = require('cron');

export function loopDeletePdts() {
  let isCronJobRunning = false;

  let cronJob = new cron.CronJob('0 * * * * *', async () => {
    if (!isCronJobRunning) {
      isCronJobRunning = true;

      try {
        await deletePdts().catch(e =>
          helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_DELETE_PDTS)
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

  await forEachSeries(projects, async project => {
    let projectStructIds = repos
      .filter(repo => repo.project_id === project.project_id)
      .map(x => x.struct_id);

    if (project.connection === api.ProjectConnectionEnum.BigQuery) {
      await deletePdtsBigquery({
        project: project,
        projectStructIds: projectStructIds
      });
    } else if (project.connection === api.ProjectConnectionEnum.PostgreSQL) {
      await deletePdtsPostgres({
        project: project,
        projectStructIds: projectStructIds
      });
    }
  });
}

async function deletePdtsBigquery(item: {
  project: entities.ProjectEntity;
  projectStructIds: string[];
}) {
  let project = item.project;

  let bigquery = new BigQuery({
    projectId: project.bigquery_project,
    keyFilename: project.bigquery_credentials_file_path
  });

  const [tables] = await bigquery
    .dataset(`mprove_${project.project_id}`)
    .getTables();

  if (tables && tables.length > 0) {
    await forEachSeries(tables, async (table: any) => {
      let tableId = table.id;
      let tableStructId = tableId.substring(0, tableId.indexOf('_'));

      if (item.projectStructIds.indexOf(tableStructId) < 0) {
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
}

async function deletePdtsPostgres(item: {
  project: entities.ProjectEntity;
  projectStructIds: string[];
}) {
  let project = item.project;

  let cn = {
    host: project.postgres_host,
    port: project.postgres_port,
    database: project.postgres_database,
    user: project.postgres_user,
    password: project.postgres_password
  };

  let db = pgp(cn);

  let mproveSchema = `mprove_${project.project_id}`;

  let sqlTextGetTables = `SELECT tablename FROM pg_tables WHERE schemaname = '${mproveSchema}'`;

  let tables = await db.any(sqlTextGetTables).catch((e: any) => {
    helper.reThrow(e, enums.postgresErrorsEnum.POSTGRES_GET_TABLES);
  });

  if (tables && tables.length > 0) {
    let tableNames = tables.map((x: any) => x.tablename);

    await forEachSeries(tableNames, async (tableName: any) => {
      let tableStructId = tableName
        .substring(0, tableName.indexOf('_'))
        .toUpperCase();

      if (item.projectStructIds.indexOf(tableStructId) < 0) {
        let sqlTextDropTable = `DROP TABLE IF EXISTS ${mproveSchema}.${tableName}`;

        await db.any(sqlTextDropTable).catch((e: any) => {
          helper.reThrow(e, enums.postgresErrorsEnum.POSTGRES_DROP_TABLE);
        });
      }
    });
  }
}
