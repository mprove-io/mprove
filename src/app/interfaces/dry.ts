import * as api from 'src/app/api/_index';

export interface Dry {
  dry_id: string;
  valid_estimates: api.QueryEstimate[];
}
