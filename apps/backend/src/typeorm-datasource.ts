import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { appEntities } from '~backend/app-entities';
import { appMigrations } from '~backend/app-migrations';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.CLI_TYPEORM_HOST,
  port: 3306,
  username: process.env.CLI_TYPEORM_USERNAME,
  password: process.env.CLI_TYPEORM_PASSWORD,
  database: process.env.CLI_TYPEORM_DATABASE,
  entities: appEntities,
  migrations: appMigrations
});
