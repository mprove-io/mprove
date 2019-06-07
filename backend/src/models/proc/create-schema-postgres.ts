import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { entities } from '../../barrels/entities';

const pgp = require('pg-promise')({ noWarnings: true });

export async function createSchemaPostgres(item: {
  project: entities.ProjectEntity;
}) {
  let cn = {
    host: item.project.postgres_host,
    port: item.project.postgres_port,
    database: item.project.postgres_database,
    user: item.project.postgres_user,
    password: item.project.postgres_password
  };

  let db = pgp(cn);

  let sqlText = `CREATE SCHEMA IF NOT EXISTS mprove_${item.project.project_id}`;

  await db.any(sqlText).catch((e: any) => {
    helper.reThrow(e, enums.postgresErrorsEnum.POSTGRES_CREATE_SCHEMA);
  });
}
