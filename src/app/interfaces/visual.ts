import * as api from 'app/api/_index';

export interface Visual {
  query: api.Query;
  mconfig: api.Mconfig;
  chart: api.Chart;
  select_fields: api.ModelField[];
  is_model_hidden: boolean;
  has_access_to_model: boolean;
}
