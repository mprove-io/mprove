import { schemaPostgres } from '~backend/barrels/schema-postgres';

export class DbRecords {
  users?: schemaPostgres.UserEnt[];
}
