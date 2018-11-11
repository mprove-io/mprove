import * as api from 'app/api/_index';

export interface Dry {
  dry_id: string;
  valid_estimates: api.QueryEstimate[];
}
