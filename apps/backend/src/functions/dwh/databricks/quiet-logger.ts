import { DBSQLLogger, LogLevel } from '@databricks/sql';

export const quietLogger: DBSQLLogger = new DBSQLLogger({
  level: LogLevel.error
});
