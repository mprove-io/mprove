import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { getQueryUsingPostgresQueryJobId } from './get-query-using-postgres-query-job-id';
import { saveQueryToDatabase } from './save-query-to-database';

const pgp = require('pg-promise')({ noWarnings: true });

export async function runQueryWithoutDepsPostgres(item: {
  project: entities.ProjectEntity;
  user_id: string;
  query: entities.QueryEntity;
  new_last_run_ts: string;
}) {
  let query = item.query;

  let sqlArray: string[] = JSON.parse(query.sql);
  let sqlText = sqlArray.join('\n');

  let postgresQueryJobId = helper.makeId();

  let mproveSchema = `mprove_${item.project.project_id}`;

  if (query.is_pdt === enums.bEnum.TRUE) {
    sqlText =
      `CREATE TABLE ` +
      `${mproveSchema}.${query.pdt_id}_${postgresQueryJobId} AS \n` +
      sqlText;
  }

  let cn = {
    host: item.project.postgres_host,
    port: item.project.postgres_port,
    database: item.project.postgres_database,
    user: item.project.postgres_user,
    password: item.project.postgres_password
  };

  query.status = api.QueryStatusEnum.Running;
  query.refresh = null;
  query.postgres_query_job_id = postgresQueryJobId;
  query.last_run_by = item.user_id;
  query.last_run_ts = item.new_last_run_ts;

  let db = pgp(cn);

  db.any(sqlText)
    .then(async (data: any) => {
      // console.log('runQueryWithoutDepsPostgres - catchData: ', data);

      let q = await getQueryUsingPostgresQueryJobId({
        query_id: query.query_id,
        postgres_query_job_id: postgresQueryJobId
      });

      if (q && q.postgres_query_job_id === postgresQueryJobId) {
        if (query.is_pdt === enums.bEnum.TRUE) {
          let sqlTextDropTable =
            `DROP TABLE IF EXISTS ` + `${mproveSchema}.${query.pdt_id}`;

          let db2 = pgp(cn);

          await db2.any(sqlTextDropTable).catch((errorDrop: any) => {
            helper.reThrow(
              errorDrop,
              enums.postgresErrorsEnum.POSTGRES_DROP_TABLE
            );
          });

          let sqlTextRenameTable =
            `SET search_path TO ${mproveSchema}; \n` +
            `ALTER TABLE ${query.pdt_id}_${postgresQueryJobId} RENAME TO ${
              query.pdt_id
            };`;

          let db3 = pgp(cn);

          await db3.any(sqlTextRenameTable).catch((errorRename: any) => {
            helper.reThrow(
              errorRename,
              enums.postgresErrorsEnum.POSTGRES_RENAME_TABLE
            );
          });
        }

        let newServerTs = helper.makeTs();
        let newLastCompleteTs = helper.makeTs();

        let newLastCompleteDuration = Math.floor(
          (Number(newLastCompleteTs) - Number(query.last_run_ts)) / 1000
        ).toString();

        q.status = api.QueryStatusEnum.Completed;
        q.refresh = null;
        q.data =
          query.is_pdt === enums.bEnum.TRUE ? null : JSON.stringify(data);
        q.last_complete_ts = newLastCompleteTs;
        q.last_complete_duration = newLastCompleteDuration;
        q.postgres_query_job_id = null;
        q.server_ts = newServerTs;

        await saveQueryToDatabase({
          new_server_ts: newServerTs,
          query: q
        });
      }
    })
    .catch(async (error: any) => {
      // console.log('runQueryWithoutDepsPostgres - catchError: ', error);

      let q = await getQueryUsingPostgresQueryJobId({
        query_id: query.query_id,
        postgres_query_job_id: postgresQueryJobId
      });

      if (q && q.postgres_query_job_id === postgresQueryJobId) {
        let newServerTs = helper.makeTs();
        let newLastErrorTs = helper.makeTs();

        q.status = api.QueryStatusEnum.Error;
        q.refresh = null;
        q.last_error_message = error.message;
        q.last_error_ts = newLastErrorTs;
        q.postgres_query_job_id = null;
        q.server_ts = newServerTs;

        await saveQueryToDatabase({
          new_server_ts: newServerTs,
          query: q
        });
      }
    });

  return query;
}
