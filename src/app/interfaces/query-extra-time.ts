import { QueryExtra } from 'src/app/interfaces/query-extra';

export interface QueryExtraTime extends QueryExtra {
  extra_time_completed_time_ago_from_now?: string;
}
