import * as api from 'src/app/api/_index';

export interface QueryExtra extends api.Query {
  extra_is_completed: boolean;
  extra_last_complete_duration_ceil: number;
}
