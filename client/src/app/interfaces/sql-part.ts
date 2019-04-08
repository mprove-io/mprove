import * as api from '@app/api/_index';

export interface SqlPart {
  part: string;
  last_error_message: string;
  status: api.QueryStatusEnum;
  sql: string;
}
