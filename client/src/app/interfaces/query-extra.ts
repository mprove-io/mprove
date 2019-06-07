import * as api from '@app/api/_index';

export interface QueryExtra extends api.Query {
  extra_is_completed: boolean;
}
